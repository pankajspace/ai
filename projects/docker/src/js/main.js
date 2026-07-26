// Docker Demo Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/docker").

const API = document.body.dataset.apiBase || "";

const SERVICES = {
    quickbite: {
        statusPath: "/quickbite/status",
        statusId: "quickbite-status",
        buttonId: "qb-predict-btn",
    },
    scalergpt: {
        statusPath: "/scalergpt/status",
        statusId: "scalergpt-status",
        buttonId: "sg-ask-btn",
    },
    deskbuddy: {
        statusPath: "/deskbuddy/status",
        statusId: "deskbuddy-status",
        buttonId: "db-chat-btn",
    },
};

function setServiceState(name, state, label) {
    const service = SERVICES[name];
    const statusEl = document.getElementById(service.statusId);
    const button = document.getElementById(service.buttonId);
    const available = state === "ready";

    statusEl.className = `service-status ${state}`;
    statusEl.textContent = label;
    button.dataset.available = String(available);
    button.disabled = !available;
}

async function checkService(name) {
    const service = SERVICES[name];

    try {
        const response = await fetch(`${API}${service.statusPath}`);
        const data = await response.json();
        if (!response.ok || !data.available) {
            throw new Error(data.error || "Service unavailable");
        }

        if (name === "scalergpt" && data.docs_indexed === 0) {
            setServiceState(name, "setup", "No documents");
            return;
        }

        const label = name === "scalergpt"
            ? `Ready · ${data.docs_indexed} docs`
            : "Ready";
        setServiceState(name, "ready", label);
    } catch {
        setServiceState(name, "offline", "Not running");
    }
}

function restoreButton(button, label) {
    button.textContent = label;
    button.disabled = button.dataset.available !== "true";
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
        restoreButton(btn, "Predict ETA 🛵");
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
        restoreButton(btn, "Ask ScalerGPT 📚");
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
        restoreButton(btn, "Send to Agent 🤖");
    }
}

// ── Toggle buttons (Yes/No for QuickBite) ────────────────────────────

function setupToggles() {
    document.querySelectorAll(".toggle-opt").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const field = btn.dataset.field;
            const val = btn.dataset.val;

            btn.parentElement.querySelectorAll(".toggle-opt").forEach((b) =>
                b.classList.remove("active")
            );
            btn.classList.add("active");
            document.getElementById(field).value = val;
        });
    });
}

// ── Init ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    setupToggles();
    Object.keys(SERVICES).forEach(checkService);
});
