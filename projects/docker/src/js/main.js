// Docker Quiz Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/docker").

const API = document.body.dataset.apiBase || "";

let score = 0;
let answered = 0;
let currentQuestion = null;

/**
 * Fetch a random quiz question from the API and render it.
 */
async function loadQuestion() {
    const questionArea = document.getElementById("quizQuestion");
    const resultEl = document.getElementById("quizResult");
    const navEl = document.getElementById("quizNav");
    const startBtn = document.getElementById("quizStartBtn");

    // Reset UI
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

/**
 * Render a question with clickable choice buttons.
 * @param {object} q - Question object with id, question, choices, total
 */
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

/**
 * Submit the user's answer and show the result.
 * @param {number} answerIndex
 */
async function submitAnswer(answerIndex) {
    if (!currentQuestion) return;

    // Disable all choice buttons immediately
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

        // Highlight correct/wrong
        buttons.forEach((btn, i) => {
            if (i === data.correct_index) btn.classList.add("correct");
            if (i === answerIndex && !data.correct) btn.classList.add("wrong");
        });

        // Show explanation
        const resultEl = document.getElementById("quizResult");
        const icon = data.correct ? "✅" : "❌";
        const cssClass = data.correct ? "correct-result" : "wrong-result";
        resultEl.className = `result visible ${cssClass}`;
        resultEl.textContent = `${icon} ${data.explanation}`;

        // Show nav
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

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("quizStartBtn")
        .addEventListener("click", loadQuestion);

    document
        .getElementById("nextBtn")
        .addEventListener("click", loadQuestion);
});
