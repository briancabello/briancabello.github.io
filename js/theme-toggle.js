(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const STORAGE_KEY = "portfolio-theme";

    function getInitialTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") return saved;
        return mq.matches ? "dark" : "light";
    }

    function applyTheme(theme) {
        root.setAttribute("data-bs-theme", theme);
        syncButtonUI(theme);
    }

    function syncButtonUI(theme) {
        const btn = document.getElementById("themeToggle");
        const icon = document.getElementById("themeIcon");
        if (!btn || !icon) return false;

        const isDark = theme === "dark";
        icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        btn.classList.remove("btn-link", "btn-outline-secondary", "btn-outline-light");
        btn.classList.add(isDark ? "btn-outline-light" : "btn-outline-secondary");
        btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        return true;
    }

    applyTheme(getInitialTheme());

    const observer = new MutationObserver(() => {
        if (syncButtonUI(root.getAttribute("data-bs-theme") || "light")) {
            observer.disconnect();
        }
    });
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    document.addEventListener("click", (e) => {
        const toggle = e.target.closest("#themeToggle");
        if (!toggle) return;
        const next = (root.getAttribute("data-bs-theme") || "light") === "dark" ? "light" : "dark";
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    });

    mq.addEventListener("change", (e) => {
        if (localStorage.getItem(STORAGE_KEY)) return;
        applyTheme(e.matches ? "dark" : "light");
    });
})();
