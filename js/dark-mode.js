// ===== DARK MODE MANAGER =====
class DarkModeManager {
    constructor() {
        this.themeToggle = null;
        this.themeIcon = null;
        this.darkModeStyles = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.darkModeStyles = document.getElementById('darkModeStyles');
        this.setupThemeToggle();
        this.applySavedTheme();
        this.setupSystemThemeListener();
    }

    setupThemeToggle() {
        // Create toggle button if it doesn't exist in template
        setTimeout(() => {
            const navbar = document.querySelector('.navbar .container');
            if (navbar && !document.getElementById('themeToggle')) {
                const toggleBtn = this.createThemeToggle();
                const navCollapse = navbar.querySelector('.navbar-collapse');
                if (navCollapse) {
                    navCollapse.parentNode.insertBefore(toggleBtn, navCollapse);
                } else {
                    navbar.appendChild(toggleBtn);
                }
            }
            this.themeToggle = document.getElementById('themeToggle');
            this.themeIcon = document.getElementById('themeIcon');
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
        }, 100);
    }

    createThemeToggle() {
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle-btn btn btn-sm btn-outline-light ms-3';
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.innerHTML = `
            <i id="themeIcon" class="fas fa-moon"></i>
            <span class="d-none d-md-inline">Dark Mode</span>
        `;
        return button;
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {
            this.disableDarkMode();
            localStorage.setItem('portfolio-theme', 'light');
        } else {
            this.enableDarkMode();
            localStorage.setItem('portfolio-theme', 'dark');
        }

        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { isDark: !isDark }
        }));
    }

    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (this.darkModeStyles) {
            this.darkModeStyles.disabled = false;
        }
        if (this.themeIcon) {
            this.themeIcon.className = 'fas fa-sun';
            if (this.themeToggle.querySelector('span')) {
                this.themeToggle.querySelector('span').textContent = 'Light Mode';
            }
        }
    }

    disableDarkMode() {
        document.documentElement.removeAttribute('data-theme');
        if (this.darkModeStyles) {
            this.darkModeStyles.disabled = true;
        }
        if (this.themeIcon) {
            this.themeIcon.className = 'fas fa-moon';
            if (this.themeToggle.querySelector('span')) {
                this.themeToggle.querySelector('span').textContent = 'Dark Mode';
            }
        }
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e) => {
            const savedTheme = localStorage.getItem('portfolio-theme');
            // Only auto-switch if user hasn't made a manual choice
            if (!savedTheme) {
                if (e.matches) {
                    this.enableDarkMode();
                } else {
                    this.disableDarkMode();
                }
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
}

// Initialize Dark Mode Manager
const darkModeManager = new DarkModeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = darkModeManager;
}