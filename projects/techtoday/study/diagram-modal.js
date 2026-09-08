/**
 * TechToday Study Guides - Diagram Lightbox & Fullscreen Modal Controller
 */
(function () {
    function initDiagramModal() {
        let modal = document.getElementById('diagramModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'diagramModal';
            modal.className = 'diagram-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Enlarged Architectural Diagram');
            modal.innerHTML = `
                <div class="diagram-modal-content">
                    <div class="diagram-modal-header">
                        <div class="diagram-modal-title"></div>
                        <button class="diagram-modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="diagram-modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.diagram-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => modal.classList.remove('active'));
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            });
        }

        // Attach to all diagram expand buttons
        document.querySelectorAll('.diagram-btn-expand').forEach((btn) => {
            btn.onclick = (e) => {
                e.preventDefault();
                const card = btn.closest('.study-diagram, .study-diagram-container, .concept-diagram-card');
                if (!card) return;
                const svg = card.querySelector('svg');
                const title = card.querySelector('.study-diagram-title');
                if (svg && modal) {
                    const titleElem = modal.querySelector('.diagram-modal-title');
                    const bodyElem = modal.querySelector('.diagram-modal-body');
                    if (titleElem) titleElem.textContent = title ? title.textContent : 'Detailed Architectural Diagram';
                    if (bodyElem) bodyElem.innerHTML = svg.outerHTML;
                    modal.classList.add('active');
                }
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDiagramModal);
    } else {
        initDiagramModal();
    }
})();

