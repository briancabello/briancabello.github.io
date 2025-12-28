(() => {
    const root = document.documentElement; // <html>
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    let userToggledThisSession = false;

    function setButtonUI(theme) {
        const btn = document.getElementById("themeToggle");
        const icon = document.getElementById("themeIcon");
        if (!btn || !icon) return;

        const isDark = theme === "dark";

        // icon swap
        icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";

        // button contrast swap
        btn.classList.toggle("btn-outline-secondary", !isDark);
        btn.classList.toggle("btn-outline-light", isDark);

        btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    function applyTheme(theme) {
        root.setAttribute("data-bs-theme", theme);
        setButtonUI(theme);
    }

    function getCurrentTheme() {
        return root.getAttribute("data-bs-theme") || "light";
    }

    // Initial theme: follow system
    applyTheme(mq.matches ? "dark" : "light");

    // Toggle click
    document.addEventListener("click", (e) => {
        const toggle = e.target.closest("#themeToggle");
        if (!toggle) return;

        userToggledThisSession = true;
        const next = getCurrentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
    });

    // If system theme changes, only auto-update if user hasn't toggled this session
    mq.addEventListener("change", (e) => {
        if (userToggledThisSession) return;
        applyTheme(e.matches ? "dark" : "light");
    });

    // If your app renders templates after load, ensure UI sync after render
    document.addEventListener("DOMContentLoaded", () => {
        setButtonUI(getCurrentTheme());
    });
})();
