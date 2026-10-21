/* ==========================================================================
   TechToday - AI Study Guide Scripts
   Page layout, topic sidebar, progress bar, back-to-top, and code copy.
   Matches the architecture of Python & DSA study guides.
   ========================================================================== */

(() => {
    const progress = document.querySelector(".progress");
    const backToTop = document.querySelector(".back-to-top");
    const toc = document.querySelector(".table-of-contents");
    const article = document.querySelector("article.study");
    const main = document.querySelector("main");
    const desktopMenu = window.matchMedia("(min-width: 961px)");

    /* ------------------------------------------------ topic sidebar layout */
    const setupTopicMenu = () => {
        let nav = document.querySelector(".topic-menu");
        let panel, list;
        if (nav) {
            panel = nav.querySelector(".topic-menu-panel");
            list = nav.querySelector(".table-of-contents");
        } else {
            if (!toc || !article || !main) return null;

            nav = document.createElement("nav");
            nav.className = "topic-menu";
            nav.setAttribute("aria-label", "Topics");

            panel = document.createElement("details");
            panel.className = "topic-menu-panel";

            const summary = document.createElement("summary");
            summary.textContent = "Topics";

            list = toc.cloneNode(true);
            panel.append(summary, list);
            nav.append(panel);
            main.classList.add("study-layout");
            main.prepend(nav);
        }
        if (!panel || !list) return nav;

        const links = [...list.querySelectorAll("a")];
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
            const marker = 96;
            let current = sections[0];
            for (const item of sections) {
                if (item.heading.getBoundingClientRect().top <= marker) current = item;
            }
            links.forEach((link) => link.classList.toggle("is-active", link === current?.link));
        };

        list.addEventListener("click", (event) => {
            if (!desktopMenu.matches && event.target.closest("a")) panel.open = false;
        });

        desktopMenu.addEventListener("change", syncPanel);
        window.addEventListener("scroll", setActive, { passive: true });
        syncPanel();
        setActive();
        return nav;
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupTopicMenu);
    } else {
        setupTopicMenu();
    }

    /* ------------------------------------------------ scroll & back-to-top */
    const updateScroll = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        if (progress) {
            progress.style.width = `${Math.min(percentage, 100)}%`;
        }
        if (backToTop) {
            backToTop.classList.toggle("visible", window.scrollY > 600);
        }
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
    updateScroll();

    /* ------------------------------------------------ copy text helper */
    const copyText = async (text) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) {
            throw new Error("Copy failed");
        }
    };

    /* ------------------------------------------------ code blocks copy */
    document.querySelectorAll("pre").forEach((block) => {
        if (block.querySelector(".copy-code") || block.parentElement.querySelector(".copybtn") || block.parentElement.querySelector(".copy")) {
            return;
        }
        const button = document.createElement("button");
        button.className = "copy-code";
        button.type = "button";
        button.textContent = "Copy";
        button.setAttribute("aria-label", "Copy code");
        button.addEventListener("click", async () => {
            try {
                await copyText(block.textContent);
                button.textContent = "Copied";
            } catch {
                button.textContent = "Copy failed";
            }
            window.setTimeout(() => {
                button.textContent = "Copy";
            }, 1400);
        });
        block.append(button);
    });

    /* ------------------------------------------------ table wrapper */
    document.querySelectorAll("table").forEach((table) => {
        if (!table.parentElement.classList.contains("table-wrap")) {
            const wrapper = document.createElement("div");
            wrapper.className = "table-wrap";
            table.before(wrapper);
            wrapper.append(table);
        }
    });

    /* ------------------------------------------------ topic & part accordion */
    const toggleCard = (card, headerSelector, forceOpen = null) => {
        if (!card) return;
        const header = card.querySelector(headerSelector);
        const willOpen = forceOpen !== null ? forceOpen : card.classList.contains("is-collapsed");
        card.classList.toggle("is-collapsed", !willOpen);
        if (header) {
            header.setAttribute("aria-expanded", String(willOpen));
        }
    };

    const openAndScrollTo = (targetId) => {
        if (!targetId) return;
        const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
        const target = document.getElementById(decodeURIComponent(cleanId));
        if (!target) return;

        const part = target.closest(".part-section");
        if (part) {
            toggleCard(part, ".part-header", true);
        }

        const section = target.closest(".topic-section");
        if (section) {
            toggleCard(section, ".topic-header", true);
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
        } else {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    document.addEventListener("click", (e) => {
        if (e.target.closest(".headerlink")) return;

        const partHeader = e.target.closest(".part-header");
        if (partHeader) {
            const part = partHeader.closest(".part-section");
            toggleCard(part, ".part-header");
            return;
        }

        const topicHeader = e.target.closest(".topic-header");
        if (topicHeader) {
            const section = topicHeader.closest(".topic-section");
            toggleCard(section, ".topic-header");
            return;
        }

        const link = e.target.closest("a");
        if (link) {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#") && href.length > 1) {
                openAndScrollTo(href);
            }
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const partHeader = e.target.closest(".part-header");
            if (partHeader) {
                e.preventDefault();
                const part = partHeader.closest(".part-section");
                toggleCard(part, ".part-header");
                return;
            }

            const topicHeader = e.target.closest(".topic-header");
            if (topicHeader) {
                e.preventDefault();
                const section = topicHeader.closest(".topic-section");
                toggleCard(section, ".topic-header");
            }
        }
    });

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-course-action]");
        if (!btn) return;
        const action = btn.dataset.courseAction;
        if (action === "expand-all") {
            document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, ".topic-header", true));
            document.querySelectorAll(".part-section").forEach((part) => toggleCard(part, ".part-header", true));
        } else if (action === "collapse-all") {
            document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, ".topic-header", false));
            document.querySelectorAll(".part-section").forEach((part) => toggleCard(part, ".part-header", false));
        }
    });
})();
