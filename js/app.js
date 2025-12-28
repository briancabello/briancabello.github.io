class PortfolioApp {
    constructor() {
        this.templates = {};
        this.data = {};
    }

    async init() {
        try {
            await this.registerTemplates();
            await this.loadData();
            this.renderPortfolio();
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

        for (const name of templateFiles) {
            const response = await fetch(`templates/${name}.html`);
            const templateHtml = await response.text();
            this.templates[name] = Handlebars.compile(templateHtml);
        }
    }

    async loadData() {
        const [about, skills, projects, education, experience, contact] = await Promise.all([
            this.fetchJSON('data/about.json'),
            this.fetchJSON('data/skills.json'),
            this.fetchJSON('data/projects.json'),
            this.fetchJSON('data/education.json'),
            this.fetchJSON('data/experience.json'),
            this.fetchJSON('data/contact.json')
        ]);

        this.data = {
            about,
            skills: skills.skills,
            projects: projects.projects,
            education: education.education,
            experiences: experience.experiences,
            contact,
            currentYear: new Date().getFullYear()
        };
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.json();
    }

    renderPortfolio() {
        const app = document.getElementById('app');
        app.innerHTML = `
            ${this.templates.navigation(this.data)}
            ${this.templates.hero(this.data)}
            ${this.templates.about(this.data)}
            ${this.templates.skills(this.data)}
            ${this.templates.projects(this.data)}
            ${this.templates.education(this.data)}
            ${this.templates.experience(this.data)}
            ${this.templates.contact(this.data)}
            ${this.templates.footer(this.data)}
        `;
    }

    initUI() {
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    showError(error) {
        document.getElementById('app').innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    <h4>Error Loading Portfolio</h4>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                </div>
            </div>
        `;
    }
}

// Execute
new PortfolioApp().init();