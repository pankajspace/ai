// InterviewIQ Frontend Client Logic
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/interviewiq").

const API = document.body.dataset.apiBase || "";

let questions = [];
let currentQuestionIndex = 0;

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
    await fetchQuestions();
    await updateScorecard();
    setupEventListeners();
});

async function fetchQuestions() {
    try {
        const res = await fetch(`${API}/questions`);
        questions = await res.json();
        renderQuestionNav();
        renderCurrentQuestion();
    } catch (err) {
        console.error("Failed to load questions:", err);
    }
}

function renderQuestionNav() {
    const nav = document.getElementById("questionNav");
    nav.innerHTML = "";
    questions.forEach((q, idx) => {
        const btn = document.createElement("button");
        btn.className = `q-btn ${idx === currentQuestionIndex ? "active" : ""}`;
        btn.innerText = `Q${q.id}: ${q.category}`;
        btn.onclick = () => selectQuestion(idx);
        nav.appendChild(btn);
    });
}

function selectQuestion(idx) {
    currentQuestionIndex = idx;
    renderQuestionNav();
    renderCurrentQuestion();
    document.getElementById("answerInput").value = "";
    document.getElementById("charCount").innerText = "0 chars";
}

function renderCurrentQuestion() {
    if (!questions.length) return;
    const q = questions[currentQuestionIndex];
    document.getElementById("questionCategoryBadge").innerText = q.category;
    document.getElementById("questionNumberBadge").innerText = `Question ${q.id} of ${questions.length}`;
    document.getElementById("questionText").innerText = q.question;

    const chipsContainer = document.getElementById("expectedKeywordChips");
    chipsContainer.innerHTML = "";
    q.expected_keywords.forEach(kw => {
        const chip = document.createElement("span");
        chip.className = "keyword-chip";
        chip.innerText = kw;
        chipsContainer.appendChild(chip);
    });
}

function setupEventListeners() {
    const answerInput = document.getElementById("answerInput");
    answerInput.addEventListener("input", (e) => {
        document.getElementById("charCount").innerText = `${e.target.value.length} chars`;
    });

    document.getElementById("btnStrongAnswer").onclick = () => {
        if (!questions.length) return;
        const q = questions[currentQuestionIndex];
        answerInput.value = q.sample_strong_answer || "";
        document.getElementById("charCount").innerText = `${answerInput.value.length} chars`;
    };

    document.getElementById("btnWeakAnswer").onclick = () => {
        if (!questions.length) return;
        const q = questions[currentQuestionIndex];
        answerInput.value = q.sample_weak_answer || "";
        document.getElementById("charCount").innerText = `${answerInput.value.length} chars`;
    };

    document.getElementById("btnEvaluate").onclick = evaluateCurrentAnswer;

    // Chat listeners
    document.getElementById("btnSendChat").onclick = () => sendCoachMessage();
    document.getElementById("chatInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendCoachMessage();
    });

    // Report modal listeners
    document.getElementById("btnGenerateReport").onclick = openFinalReport;
    document.getElementById("btnCloseModal").onclick = closeFinalReport;
    document.getElementById("modalOverlay").onclick = (e) => {
        if (e.target.id === "modalOverlay") closeFinalReport();
    };

    // Reset modal listeners
    document.getElementById("btnResetSession").onclick = openResetModal;
    document.getElementById("btnCancelReset").onclick = closeResetModal;
    document.getElementById("btnConfirmReset").onclick = async () => {
        await executeReset();
        closeResetModal();
    };
    document.getElementById("resetModalOverlay").onclick = (e) => {
        if (e.target.id === "resetModalOverlay") closeResetModal();
    };
}

async function evaluateCurrentAnswer() {
    const answerInput = document.getElementById("answerInput");
    const answer = answerInput.value.trim();
    if (!answer) {
        answerInput.focus();
        answerInput.style.borderColor = "var(--accent-rose)";
        setTimeout(() => {
            answerInput.style.borderColor = "var(--border-subtle)";
        }, 1500);
        return;
    }

    const q = questions[currentQuestionIndex];
    const evaluateBtn = document.getElementById("btnEvaluate");
    evaluateBtn.innerText = "Evaluating...";
    evaluateBtn.disabled = true;

    try {
        const res = await fetch(`${API}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question_id: q.id, answer }),
        });
        const data = await res.json();
        renderEvaluationResult(data);
        await updateScorecard();
    } catch (err) {
        console.error("Evaluation error:", err);
        alert("Failed to evaluate answer. Please check server logs.");
    } finally {
        evaluateBtn.innerHTML = "🚀 Evaluate Answer";
        evaluateBtn.disabled = false;
    }
}

function renderEvaluationResult(data) {
    if (!data) return;
    const { turn, feedback, relevance_evaluation = {}, star_evaluation = {}, filler_evaluation = {} } = data;

    // Relevance stat
    const relScore = relevance_evaluation.score || 0;
    const relElem = document.getElementById("statRelevance");
    if (relElem) {
        relElem.innerText = `${relScore}/100`;
        relElem.className = `stat-value ${relScore >= 75 ? "green" : relScore >= 45 ? "amber" : "rose"}`;
    }
    const relSub = document.getElementById("statRelevanceSub");
    if (relSub) {
        relSub.innerText = `${relevance_evaluation.quality || ""} Quality`;
    }

    // STAR stat
    const starScore = star_evaluation.star_score || 0;
    const starElem = document.getElementById("statStar");
    if (starElem) {
        starElem.innerText = `${starScore}%`;
    }
    const starSub = document.getElementById("statStarSub");
    if (starSub) {
        const coveredCount = star_evaluation.covered_components ? star_evaluation.covered_components.length : 0;
        starSub.innerText = `${coveredCount}/4 Components`;
    }

    // Update STAR visual steps (S, T, A, R)
    const starS = document.getElementById("starS");
    const starT = document.getElementById("starT");
    const starA = document.getElementById("starA");
    const starR = document.getElementById("starR");
    if (starS) starS.className = `star-step ${star_evaluation.situation ? "active" : ""}`;
    if (starT) starT.className = `star-step ${star_evaluation.task ? "active" : ""}`;
    if (starA) starA.className = `star-step ${star_evaluation.action ? "active" : ""}`;
    if (starR) starR.className = `star-step ${star_evaluation.result ? "active" : ""}`;

    // Fillers stat
    const fillerCount = filler_evaluation.total_filler_count || 0;
    const fillerElem = document.getElementById("statFillers");
    if (fillerElem) {
        fillerElem.innerText = fillerCount;
        fillerElem.className = `stat-value ${fillerCount === 0 ? "green" : fillerCount <= 2 ? "amber" : "rose"}`;
    }
    const fillerSub = document.getElementById("statFillersSub");
    if (fillerSub) {
        fillerSub.innerText = `${filler_evaluation.filler_density_per_100_words || 0}% Density`;
    }

    // Feedback
    const feedbackBox = document.getElementById("feedbackContent");
    if (feedbackBox) {
        feedbackBox.innerHTML = markedParse(feedback || "No feedback generated.");
    }

    // Update keyword chip statuses in question card
    const matchedList = relevance_evaluation.matched_keywords || [];
    const matched = new Set(matchedList.map(k => String(k).toLowerCase()));
    const chips = document.querySelectorAll("#expectedKeywordChips .keyword-chip");
    chips.forEach(chip => {
        if (matched.has(chip.innerText.toLowerCase())) {
            chip.className = "keyword-chip matched";
        } else {
            chip.className = "keyword-chip missing";
        }
    });

    const diagElem = document.getElementById("diagnosticDetails");
    if (diagElem) {
        diagElem.style.display = "block";
    }
}

async function updateScorecard() {
    try {
        const res = await fetch(`${API}/scorecard`);
        const data = await res.json();

        document.getElementById("sessionStatsSummary").innerText = 
            `Session Average Relevance: ${data.average_relevance}/100 | Questions Answered: ${data.total_questions}`;

        const tbody = document.getElementById("scorecardTableBody");
        tbody.innerHTML = "";

        if (data.scorecard.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No answers evaluated yet. Select a question and click Evaluate!</td></tr>`;
            return;
        }

        data.scorecard.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${row.Turn}</td>
                <td><span class="badge badge-purple">${row.Category}</span></td>
                <td>${row.Question}</td>
                <td><strong style="color: var(--accent-cyan)">${row["Relevance Score"]}</strong></td>
                <td>${row["STAR Score"]}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Failed to update scorecard:", err);
    }
}

async function sendCoachMessage(customPrompt = null) {
    const input = document.getElementById("chatInput");
    const query = typeof customPrompt === "string" ? customPrompt : input.value.trim();
    if (!query) return;

    appendChatMessage("user", query);
    if (!customPrompt) input.value = "";

    const typingId = appendChatMessage("coach", "Thinking...");

    try {
        const res = await fetch(`${API}/coach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        removeChatMessage(typingId);
        appendChatMessage("coach", data.response);
    } catch (err) {
        removeChatMessage(typingId);
        appendChatMessage("coach", "⚠️ Could not connect to AI Coach. Please verify server status.");
    }
}

function appendChatMessage(role, text) {
    const container = document.getElementById("chatMessages");
    const bubble = document.createElement("div");
    const msgId = "msg_" + Date.now() + "_" + Math.random();
    bubble.id = msgId;
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = markedParse(text);
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return msgId;
}

function removeChatMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function openFinalReport() {
    try {
        const res = await fetch(`${API}/report`);
        const data = await res.json();
        document.getElementById("reportContent").innerHTML = markedParse(data.report_text);
        document.getElementById("modalOverlay").classList.add("active");
    } catch (err) {
        alert("Failed to load final report.");
    }
}

function closeFinalReport() {
    document.getElementById("modalOverlay").classList.remove("active");
}

function openResetModal() {
    const modal = document.getElementById("resetModalOverlay");
    if (modal) modal.classList.add("active");
}

function closeResetModal() {
    const modal = document.getElementById("resetModalOverlay");
    if (modal) modal.classList.remove("active");
}

async function executeReset() {
    try {
        await fetch(`${API}/reset`, { method: "POST" });
        await updateScorecard();
        const chatBox = document.getElementById("chatMessages");
        if (chatBox) {
            chatBox.innerHTML = `
                <div class="chat-bubble coach">
                    👋 Hello! I am your <strong>InterviewIQ Coach</strong>. Session memory has been reset successfully. Select a question to start fresh!
                </div>
            `;
        }
        const relElem = document.getElementById("statRelevance");
        if (relElem) {
            relElem.innerText = "0/100";
            relElem.className = "stat-value blue";
        }
        const relSub = document.getElementById("statRelevanceSub");
        if (relSub) relSub.innerText = "Awaiting response";

        const starElem = document.getElementById("statStar");
        if (starElem) starElem.innerText = "0%";
        const starSub = document.getElementById("statStarSub");
        if (starSub) starSub.innerText = "0/4 Components";

        const starS = document.getElementById("starS");
        const starT = document.getElementById("starT");
        const starA = document.getElementById("starA");
        const starR = document.getElementById("starR");
        if (starS) starS.className = "star-step";
        if (starT) starT.className = "star-step";
        if (starA) starA.className = "star-step";
        if (starR) starR.className = "star-step";

        const fillerElem = document.getElementById("statFillers");
        if (fillerElem) {
            fillerElem.innerText = "0";
            fillerElem.className = "stat-value amber";
        }
        const fillerSub = document.getElementById("statFillersSub");
        if (fillerSub) fillerSub.innerText = "0.0% Density";

        const feedbackBox = document.getElementById("feedbackContent");
        if (feedbackBox) {
            feedbackBox.innerHTML = "Select a question, type or load an answer, and click <strong>Evaluate Answer</strong> to receive real-time feedback.";
        }

        selectQuestion(0);
    } catch (err) {
        console.error("Reset error:", err);
    }
}

// Simple Markdown parser for clean bold, italics, bullet points, headers
function markedParse(md) {
    if (!md) return "";
    return md
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/\n/gim, '<br>');
}
