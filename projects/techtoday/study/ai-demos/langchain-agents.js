// Topic & inner part accordions (same behaviour as the DSA courses)
    (() => {
      const toggleCard = (card, headerSelector, forceOpen = null) => {
        if (!card) return;
        const header = card.querySelector(headerSelector);
        const willOpen = forceOpen !== null ? forceOpen : card.classList.contains("is-collapsed");
        card.classList.toggle("is-collapsed", !willOpen);
        if (header) header.setAttribute("aria-expanded", String(willOpen));
      };

      const openAndScrollTo = (targetId) => {
        if (!targetId) return;
        const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
        const target = document.getElementById(decodeURIComponent(cleanId));
        if (!target) return;
        const part = target.closest(".part-section");
        if (part) toggleCard(part, ".part-header", true);
        const section = target.closest(".topic-section");
        if (section) {
          toggleCard(section, ".topic-header", true);
          setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      document.addEventListener("click", (e) => {
        if (e.target.closest(".headerlink")) return;
        const partHeader = e.target.closest(".part-header");
        if (partHeader) {
          toggleCard(partHeader.closest(".part-section"), ".part-header");
          return;
        }
        const topicHeader = e.target.closest(".topic-header");
        if (topicHeader) {
          toggleCard(topicHeader.closest(".topic-section"), ".topic-header");
          return;
        }
        const link = e.target.closest("a");
        const href = link && link.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) openAndScrollTo(href);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const partHeader = e.target.closest(".part-header");
        if (partHeader) {
          e.preventDefault();
          toggleCard(partHeader.closest(".part-section"), ".part-header");
          return;
        }
        const topicHeader = e.target.closest(".topic-header");
        if (topicHeader) {
          e.preventDefault();
          toggleCard(topicHeader.closest(".topic-section"), ".topic-header");
        }
      });

      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-course-action]");
        if (!btn) return;
        const open = btn.dataset.courseAction === "expand-all";
        document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, ".topic-header", open));
        document.querySelectorAll(".part-section").forEach((p) => toggleCard(p, ".part-header", open));
      });

      if (window.location.hash) setTimeout(() => openAndScrollTo(window.location.hash), 150);
      window.addEventListener("hashchange", () => openAndScrollTo(window.location.hash));
    })();
  
if (window.matchMedia("(min-width: 961px)").matches) document.querySelector(".topic-menu .topic-menu-panel").open = true;
