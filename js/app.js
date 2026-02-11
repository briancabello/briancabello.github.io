class PortfolioApp {
    constructor() {
        this.templates = {};
        this.data = {};
    }

    async init() {
        try {
            // 1. CHECK URL FOR PROJECT ID (SPA Logic)
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get('project'); // e.g., ?project=campus-bites

            if (projectId) {
                // SCENARIO A: Render Project Detail View
                await this.initProjectPage(projectId);
            } else {
                // SCENARIO B: Render Main Portfolio (Standard Flow)
                await Promise.all([
                    this.registerMainTemplates(),
                    this.loadMainData()
                ]);

                this.renderPortfolio();
                this.applySiteConfig();
                this.initUI();
            }

        } catch (error) {
            console.error('Error:', error);
            this.showError(error);
        }
    }

    // ============================================================
    // SCENARIO A: PROJECT DETAIL VIEW
    // ============================================================
    async initProjectPage(projectId) {
        // 1. Load ALL templates we need (Nav, Detail, Footer)
        await Promise.all([
            this.loadTemplates(['navigation', 'project-detail', 'footer']),
            this.fetchJSON(`data/projects/${projectId}.json`).then(data => { this.data.project = data; }),
            this.fetchJSON('data/site-data.json').then(data => { this.data.site = data; }),
            this.fetchJSON('data/footer.json').then(data => { this.data.footer = data; }),
            this.fetchJSON('data/about.json').then(data => { this.data.about = data; })
        ]);

        this.data.currentYear = new Date().getFullYear();

        // 2. Prepare Context
        // We add 'isProjectPage: true' so your Nav can use it if needed
        const context = {
            ...this.data.project,
            site: this.data.site,
            about: this.data.about,
            footer: this.data.footer,
            currentYear: this.data.currentYear,
            isProjectPage: true
        };

        const app = document.getElementById('app');

        if (this.templates['project-detail']) {
            // 3. Render: Nav + Detail + Footer
            app.innerHTML = `
                ${this.templates.navigation(context)}
                ${this.templates['project-detail'](context)}
                ${this.templates.footer(context)}
            `;

            document.title = `${this.data.project.title} | Case Study`;
            window.scrollTo(0, 0);
        } else {
            throw new Error('Project detail template failed to load.');
        }
    }

    // ============================================================
    // SCENARIO B: MAIN PORTFOLIO VIEW
    // ============================================================
    async registerMainTemplates() {
        const templateFiles = [
            'navigation', 'hero', 'about', 'skills',
            'projects', 'education', 'experience', 'contact', 'footer'
        ];
        // Re-use the helper to load these
        await this.loadTemplates(templateFiles);
    }

    async loadMainData() {
        // Fetch all JSON files for the main page
        const [about, skills, projects, education, experience, contact, siteData, footer] = await Promise.all([
            this.fetchJSON('data/about.json'),
            this.fetchJSON('data/skills.json'),
            this.fetchJSON('data/projects.json'),
            this.fetchJSON('data/education.json'),
            this.fetchJSON('data/experience.json'),
            this.fetchJSON('data/contact.json'),
            this.fetchJSON('data/site-data.json'),
            this.fetchJSON('data/footer.json')
        ]);

        // Combine into one data object
        this.data = {
            about,
            skills: skills.skills,
            projects: projects.projects,
            education: education.education,
            experiences: experience.experiences,
            contact,
            site: siteData,
            footer,
            currentYear: new Date().getFullYear()
        };
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

    // ============================================================
    // SHARED UTILITIES
    // ============================================================

    // Helper to load any list of templates
    async loadTemplates(names) {
        const loadPromises = names.map(async (name) => {
            const response = await fetch(`templates/${name}.html`);
            if (!response.ok) throw new Error(`Template '${name}' not found.`);
            const templateHtml = await response.text();
            this.templates[name] = Handlebars.compile(templateHtml);
        });
        await Promise.all(loadPromises);
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.json();
    }

    applySiteConfig() {
        const { site } = this.data;

        // Dynamic Page Title (Only applied if not already set by Project Page)
        if (site && site.siteName && !this.data.project) {
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

                    // Close mobile nav if open
                    const navCollapse = document.getElementById('navbarNav');
                    if (navCollapse && navCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                        if (bsCollapse) bsCollapse.hide();
                    }

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
                    <a href="index.html" class="btn btn-outline-danger mt-3">Return Home</a>
                </div>
            </div>
        `;
    }
}

new PortfolioApp().init();