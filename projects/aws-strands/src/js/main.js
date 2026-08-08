// AWS Strands — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute.  Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/aws-strands").

const API = document.body.dataset.apiBase || "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Copy text to clipboard and update the button label briefly.
 * @param {string} text
 * @param {HTMLButtonElement} btn
 */
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");
        const orig = btn.innerHTML;
        btn.innerHTML = "✓ Copied";
        setTimeout(() => {
            btn.classList.remove("copied");
            btn.innerHTML = orig;
        }, 1500);
    });
}

/**
 * Escape HTML entities in a string for safe insertion into innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render the hero stats bar.
 * @param {object} data
 */
function renderHeroStats(data) {
    const totalLessons = data.modules.reduce((n, m) => n + m.lessons.length, 0);
    const totalScripts = totalLessons + data.root_scripts.length;
    const el = document.getElementById("heroStats");
    el.innerHTML = `
        <div class="stat">
            <div class="stat-value">${data.modules.length}</div>
            <div class="stat-label">Modules</div>
        </div>
        <div class="stat">
            <div class="stat-value">${totalLessons}</div>
            <div class="stat-label">Lessons</div>
        </div>
        <div class="stat">
            <div class="stat-value">${totalScripts}</div>
            <div class="stat-label">Scripts</div>
        </div>
    `;
}

/**
 * Build the HTML for a single lesson card.
 * @param {object} lesson
 * @param {number} index
 * @param {string} accent
 * @returns {string}
 */
function lessonCardHtml(lesson, index, accent) {
    const id = `lesson-${accent}-${index}`;
    return `
        <div class="lesson-card" id="${id}">
            <div class="lesson-top" data-target="${id}">
                <div class="lesson-info">
                    <div class="${accent}">
                        <span class="lesson-number">${index + 1}</span>
                        <span class="lesson-title">${escapeHtml(lesson.title)}</span>
                    </div>
                    <div class="lesson-file">${escapeHtml(lesson.filename)}</div>
                    ${lesson.description ? `<div class="lesson-desc">${escapeHtml(lesson.description)}</div>` : ""}
                </div>
                <button class="lesson-toggle" data-target="${id}" aria-label="Toggle source code">
                    <span class="toggle-icon">▶</span>
                    View Source
                </button>
            </div>
            <div class="lesson-code" id="${id}-code">
                <div class="code-toolbar">
                    <span class="code-lang">python · ${escapeHtml(lesson.filename)}</span>
                    <button class="copy-btn" data-source="${id}">⎘ Copy</button>
                </div>
                <pre class="source-code">${escapeHtml(lesson.source)}</pre>
            </div>
        </div>
    `;
}

/**
 * Render all module blocks into the container.
 * @param {Array} modules
 */
function renderModules(modules) {
    const container = document.getElementById("modulesContainer");
    let html = "";

    for (const mod of modules) {
        const lessonCount = mod.lessons.length;
        html += `
            <div class="module-block">
                <div class="module-header ${mod.accent}">
                    <div class="module-id">${lessonCount} lesson${lessonCount !== 1 ? "s" : ""}</div>
                    <div class="module-title">${escapeHtml(mod.title)}</div>
                    <div class="module-desc">${escapeHtml(mod.description)}</div>
                </div>
                <div class="module-lessons">
                    ${mod.lessons.map((l, i) => lessonCardHtml(l, i, mod.accent)).join("")}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Render utility (root-level) scripts as cards.
 * @param {Array} scripts
 */
function renderUtilities(scripts) {
    const container = document.getElementById("utilitiesContainer");
    let html = "";

    for (const script of scripts) {
        const id = `util-${script.filename.replace(/\./g, "-")}`;
        html += `
            <div class="card" id="${id}">
                <h3>${escapeHtml(script.title)}</h3>
                <div class="card-file">${escapeHtml(script.filename)}</div>
                <p>${escapeHtml(script.description)}</p>
                <button class="lesson-toggle" data-target="${id}" aria-label="Toggle source code">
                    <span class="toggle-icon">▶</span>
                    View Source
                </button>
                <div class="lesson-code" id="${id}-code">
                    <div class="code-toolbar">
                        <span class="code-lang">python · ${escapeHtml(script.filename)}</span>
                        <button class="copy-btn" data-source="${id}">⎘ Copy</button>
                    </div>
                    <pre class="source-code">${escapeHtml(script.source)}</pre>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Interaction: toggle source code + copy
// ---------------------------------------------------------------------------

/**
 * Set up event delegation for toggle and copy buttons.
 */
function setupInteractions() {
    document.addEventListener("click", (e) => {
        // Toggle source code
        const toggleTarget = e.target.closest("[data-target]");
        if (toggleTarget && !e.target.closest(".copy-btn")) {
            const id = toggleTarget.dataset.target;
            const codeEl = document.getElementById(`${id}-code`);
            const btn = document.querySelector(`#${id} .lesson-toggle`);
            if (codeEl && btn) {
                const isVisible = codeEl.classList.contains("visible");
                codeEl.classList.toggle("visible");
                btn.classList.toggle("expanded");
                btn.innerHTML = isVisible
                    ? '<span class="toggle-icon">▶</span> View Source'
                    : '<span class="toggle-icon">▶</span> Hide Source';
            }
            return;
        }

        // Copy to clipboard
        const copyBtn = e.target.closest(".copy-btn");
        if (copyBtn) {
            const sourceId = copyBtn.dataset.source;
            const pre = document.querySelector(`#${sourceId}-code .source-code`);
            if (pre) {
                copyToClipboard(pre.textContent, copyBtn);
            }
        }
    });
}

// ---------------------------------------------------------------------------
// Guide link
// ---------------------------------------------------------------------------

function setupGuideLink() {
    const link = document.getElementById("guideLink");
    if (link) {
        link.addEventListener("click", () => {
            window.open(`${API}/guide`, "_blank");
        });
    }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    setupInteractions();
    setupGuideLink();

    try {
        const res = await fetch(`${API}/api/modules`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        renderHeroStats(data);
        renderModules(data.modules);
        renderUtilities(data.root_scripts);
    } catch (err) {
        document.getElementById("modulesContainer").innerHTML = `
            <div class="error-state">
                <p>Failed to load modules: ${escapeHtml(err.message)}</p>
            </div>
        `;
    }
});
