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
        if (!toc || !article || !main) {
            return null;
        }

        const nav = document.createElement("nav");
        nav.className = "topic-menu";
        nav.setAttribute("aria-label", "Topics");

        const panel = document.createElement("details");
        panel.className = "topic-menu-panel";

        const summary = document.createElement("summary");
        summary.textContent = "Topics";

        const list = toc.cloneNode(true);
        panel.append(summary, list);
        nav.append(panel);
        main.classList.add("study-layout");
        main.prepend(nav);

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
                if (item.heading.getBoundingClientRect().top <= marker) {
                    current = item;
                }
            }
            links.forEach((link) => {
                link.classList.toggle("is-active", link === current?.link);
            });
        };

        list.addEventListener("click", (event) => {
            if (!desktopMenu.matches && event.target.closest("a")) {
                panel.open = false;
            }
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
})();
