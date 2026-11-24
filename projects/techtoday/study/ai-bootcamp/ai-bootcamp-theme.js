/* Light/dark theme for AI Bootcamp study pages. Shares the "fws-theme" choice with the other study pages. */
(function () {
    var KEY = "fws-theme";
    var root = document.documentElement;

    try {
        var saved = localStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") {
            root.setAttribute("data-theme", saved);
        }
    } catch (e) { /* storage unavailable: follow the system setting */ }

    document.addEventListener("click", function (event) {
        var button = event.target.closest("[data-tt-theme-toggle]");
        if (!button) {
            return;
        }
        var current = root.getAttribute("data-theme");
        var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        var next = (current ? current === "dark" : systemDark) ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
            localStorage.setItem(KEY, next);
        } catch (e) { /* storage unavailable */ }
    });
})();
