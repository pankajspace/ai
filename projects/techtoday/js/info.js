// Adds syntax highlighting and a "Copy" button to code blocks on the
// "how this demo works" explainer pages (src/info/*.html).

document.addEventListener("DOMContentLoaded", () => {
    if (window.hljs) hljs.highlightAll();

    document.querySelectorAll(".info-content pre").forEach((pre) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "copy-code";
        btn.textContent = "Copy";

        btn.addEventListener("click", () => {
            const code = pre.querySelector("code").textContent;
            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = "Copied!";
                btn.classList.add("copied");
                setTimeout(() => {
                    btn.textContent = "Copy";
                    btn.classList.remove("copied");
                }, 1500);
            });
        });

        pre.appendChild(btn);
    });
});
