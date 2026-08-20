(() => {
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const updateBackToTop = () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        };
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        updateBackToTop();
    }

    // Topics menu collapsable in mobile view (matching Python study guide behavior)
    const desktopMenu = window.matchMedia("(min-width: 961px)");

    const setupTopicMenu = () => {
        const topnav = document.querySelector("#topnav");
        if (!topnav) {
            return;
        }

        const nav = topnav.querySelector("nav");
        if (!nav) {
            return;
        }

        let panel = topnav.querySelector(".topic-menu-panel");
        if (!panel) {
            panel = document.createElement("details");
            panel.className = "topic-menu-panel";

            const summary = document.createElement("summary");
            summary.className = "topic-menu-summary";
            summary.textContent = "Topics";

            const wrap = topnav.querySelector(".wrap") || topnav;
            wrap.appendChild(panel);
            panel.appendChild(summary);
            panel.appendChild(nav);
        }

        const links = [...nav.querySelectorAll("a")];
        const sections = links
            .map((link) => {
                const href = link.getAttribute("href") || "";
                if (!href.startsWith("#")) return null;
                const id = decodeURIComponent(href.slice(1));
                return { link, heading: document.getElementById(id) };
            })
            .filter((item) => item && item.heading);

        const syncPanel = () => {
            panel.open = desktopMenu.matches;
        };

        const setActive = () => {
            const marker = 120;
            let current = null;
            for (const item of sections) {
                const top = item.heading.getBoundingClientRect().top;
                if (top <= marker) {
                    current = item;
                }
            }
            links.forEach((link) => {
                link.classList.toggle("is-active", link === current?.link);
            });
        };

        nav.addEventListener("click", (event) => {
            if (!desktopMenu.matches && event.target.closest("a")) {
                panel.open = false;
            }
        });

        desktopMenu.addEventListener("change", syncPanel);
        window.addEventListener("scroll", setActive, { passive: true });
        syncPanel();
        setActive();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupTopicMenu);
    } else {
        setupTopicMenu();
    }
})();
