class PortfolioApp {
    constructor() {
        this.templates = {};
        this.data = {};
    }

    async init() {
        try {
            // 1. Load Templates and Data in Parallel
            await Promise.all([
                this.registerTemplates(),
                this.loadData()
            ]);

            // 2. Render the HTML
            this.renderPortfolio();

            // 3. Apply Config (Title, Analytics) & UI Logic (ScrollSpy)
            this.applySiteConfig();
            this.initUI();

        } catch (error) {
            console.error('Error:', error);
            this.showError(error);
        }
    }

    async registerTemplates() {
        const templateFiles = [
            'navigation', 'hero', 'about', 'skills',
            'projects', 'education', 'experience', 'contact', 'footer'
        ];

        // Fetch all HTML files from the /templates folder
        const loadPromises = templateFiles.map(async (name) => {
            const response = await fetch(`templates/${name}.html`);
            if (!response.ok) throw new Error(`Template '${name}' not found.`);
            const templateHtml = await response.text();
            this.templates[name] = Handlebars.compile(templateHtml);
        });

        await Promise.all(loadPromises);
    }

    async loadData() {
        // Fetch all JSON files, including the new site-data.json
        const [about, skills, projects, education, experience, contact, siteData] = await Promise.all([
            this.fetchJSON('data/about.json'),
            this.fetchJSON('data/skills.json'),
            this.fetchJSON('data/projects.json'),
            this.fetchJSON('data/education.json'),
            this.fetchJSON('data/experience.json'),
            this.fetchJSON('data/contact.json'),
            this.fetchJSON('data/site-data.json')
        ]);

        // Combine into one data object
        this.data = {
            about,
            skills: skills.skills,
            projects: projects.projects,
            education: education.education,
            experiences: experience.experiences,
            contact,
            site: siteData, // Accessible in HTML as {{site.siteName}}
            currentYear: new Date().getFullYear()
        };
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.json();
    }

    renderPortfolio() {
        // This overwrites the "Loading..." spinner automatically
        const app = document.getElementById('app');
        app.innerHTML = `
            ${this.templates.navigation(this.data)}
            ${this.templates.hero(this.data)}
            ${this.templates.about(this.data)}
            ${this.templates.skills(this.data)}
            ${this.templates.projects(this.data)}
            ${this.templates.experience(this.data)}
            ${this.templates.education(this.data)}
            ${this.templates.contact(this.data)}
            ${this.templates.footer(this.data)}
        `;
    }

    applySiteConfig() {
        const { site } = this.data;

        // Dynamic Page Title
        if (site && site.siteName) {
            document.title = site.siteName;
        }

        // Google Analytics Injection (if enabled in JSON)
        if (site && site.analytics && site.analytics.enabled && site.analytics.trackingId) {
            this.injectAnalytics(site.analytics.trackingId);
        }
    }

    injectAnalytics(id) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', id);
        console.log(`Analytics loaded: ${id}`);
    }

    initUI() {
        // 1. Initialize Bootstrap ScrollSpy (Refreshes the active link tracking)
        const dataSpyList = [].slice.call(document.querySelectorAll('[data-bs-spy="scroll"]'));
        dataSpyList.forEach((dataSpyEl) => {
            bootstrap.ScrollSpy.getInstance(dataSpyEl)?.refresh();
        });

        // 2. Initialize Tooltips (if you use them anywhere)
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // 3. Smooth Scrolling Logic
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    // Offset for the fixed Navbar (80px)
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });
    }

    showError(error) {
        document.getElementById('app').innerHTML = `
            <div class="d-flex align-items-center justify-content-center min-vh-100 text-danger">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>Error Loading Portfolio</h4>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-outline-danger mt-3">Retry</button>
                </div>
            </div>
        `;
    }
}

new PortfolioApp().init();