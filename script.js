document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const skillsContainer = document.getElementById('skills-container');
    const timelineContainer = document.getElementById('timeline-container');
    const languageSelector = document.getElementById('language-selector');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    let projectsData = [];
    let skillsData = [];
    let timelineData = [];

    // Scroll Reveal Animation Logic
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    // Helper to add 'reveal' class and observe elements
    const observeElements = (elements) => {
        elements.forEach((el) => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    };

    // Observe static elements initially
    const staticElements = document.querySelectorAll('.section-title, .about-content, .contact-container');
    observeElements(staticElements);

    // Theme Handling logic
    // Default to 'dark' if no theme is saved
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        // Toggle: if current is 'light' (explicitly set), go to 'dark', otherwise default behavior
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        // If theme is dark, show sun icon (to switch to light). 
        // If theme is light, show moon icon (to switch to dark).
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Load projects, skills, and timeline in parallel
    Promise.all([
        fetch('projects.json').then(res => res.json()),
        fetch('skills.json').then(res => res.json()),
        fetch('timeline.json').then(res => res.json())
    ])
        .then(([projects, skills, timeline]) => {
            projectsData = projects;
            skillsData = skills;
            timelineData = timeline;

            // Initial render
            const initialLang = languageSelector.value;
            updateStaticContent(initialLang);

            // Setup filters first
            setupProjectFilters();

            renderProjects(initialLang);
            renderSkills(initialLang);
            renderTimeline(initialLang);
        })
        .catch(error => console.error('Error loading data:', error));

    // Handle language change
    languageSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        updateStaticContent(lang);
        renderProjects(lang, document.querySelector('.filter-btn.active').dataset.filter);
        renderSkills(lang);
        renderTimeline(lang);
    });

    function updateStaticContent(lang) {
        // Update elements with data-en/data-it attributes
        const elements = document.querySelectorAll('[data-en]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });
    }

    function renderSkills(lang) {
        if (!skillsContainer) return;
        skillsContainer.innerHTML = '';

        // Helper to map numeric level to strings
        const getLevelInfo = (level) => {
            const map = {
                1: { class: 'advanced', en: 'Advanced', it: 'Avanzato' },
                2: { class: 'intermediate', en: 'Intermediate', it: 'Intermedio' },
                3: { class: 'beginner', en: 'Beginner', it: 'Principiante' }
            };
            return map[level] || { class: '', en: '', it: '' };
        };

        skillsData.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';

            const info = getLevelInfo(skill.level);

            const dot = document.createElement('span');
            dot.className = `skill-dot dot-${info.class}`;
            dot.title = info[lang];

            const icon = document.createElement('i');
            icon.className = skill.icon;

            const name = document.createElement('span');
            name.textContent = skill.name;

            card.appendChild(dot);
            card.appendChild(icon);
            card.appendChild(name);
            skillsContainer.appendChild(card);
            // Add to observer
            observeElements([card]);
        });
    }

    function renderTimeline(lang) {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';

        timelineData.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            // Alternate left/right
            const position = index % 2 === 0 ? 'left' : 'right';
            timelineItem.className = `timeline-item ${position}`;

            const content = document.createElement('div');
            content.className = 'timeline-content';

            const date = document.createElement('span');
            date.className = 'timeline-date';
            date.textContent = item.period;

            const title = document.createElement('h3');
            title.textContent = item.title;

            const subtitle = document.createElement('h4');
            subtitle.textContent = item.subtitle;

            const description = document.createElement('p');
            // Handle description as string or object (simpler than project handling for now)
            if (typeof item.description === 'object') {
                description.textContent = item.description[lang] || item.description['en'];
            } else {
                description.textContent = item.description;
            }

            content.appendChild(date);
            content.appendChild(title);
            content.appendChild(subtitle);
            content.appendChild(description);

            timelineItem.appendChild(content);
            timelineContainer.appendChild(timelineItem);

            // Add content box to observer for animation
            observeElements([content]);
        });
    }

    let currentFilter = 'all';

    function renderProjects(lang, filter = 'all') {
        projectsContainer.innerHTML = ''; // Clear existing content

        // Filter projects
        const filteredProjects = filter === 'all'
            ? projectsData
            : projectsData.filter(p => p.technologies && p.technologies.includes(filter));

        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = `<p style="text-align:center; width:100%; color: var(--text-muted);">No projects found for ${filter}.</p>`;
            return;
        }

        filteredProjects.forEach(project => {
            const card = document.createElement('a');
            card.href = project.link;
            card.className = 'card reveal'; // Added reveal class directly
            card.target = '_blank'; // Open link in new tab

            const title = document.createElement('h2');
            title.textContent = project.name;

            // Render Tech Stack
            const techContainer = document.createElement('div');
            techContainer.className = 'project-tech';
            if (project.technologies) {
                project.technologies.forEach(tech => {
                    const badge = document.createElement('span');
                    badge.className = 'tech-badge';
                    badge.textContent = tech;
                    techContainer.appendChild(badge);
                });
            }

            const description = document.createElement('p');
            // Support both old string format (if any) and new object format
            if (typeof project.description === 'object') {
                description.textContent = project.description[lang] || project.description['en'];
            } else {
                description.textContent = project.description;
            }

            const linkText = document.createElement('span');
            linkText.className = 'link-text';
            linkText.textContent = lang === 'it' ? 'Vedi Progetto →' : 'View Project →';

            card.appendChild(title);
            card.appendChild(techContainer);
            card.appendChild(description);
            card.appendChild(linkText);

            projectsContainer.appendChild(card);

            // Add to observer
            observer.observe(card);
        });
    }

    function setupProjectFilters() {
        // Collect all unique technologies
        const allTechnologies = new Set();
        projectsData.forEach(p => {
            if (p.technologies) {
                p.technologies.forEach(t => allTechnologies.add(t));
            }
        });

        const filtersContainer = document.getElementById('project-filters');
        // Clear existing dynamic filters (keep 'All')
        const allBtn = filtersContainer.querySelector('[data-filter="all"]');
        filtersContainer.innerHTML = '';
        filtersContainer.appendChild(allBtn);

        allTechnologies.forEach(tech => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = tech;
            btn.dataset.filter = tech;
            filtersContainer.appendChild(btn);
        });

        // Add event listeners (using delegation or direct attach)
        filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Add active to clicked target
                e.target.classList.add('active');

                const filter = e.target.dataset.filter;
                renderProjects(languageSelector.value, filter);
            });
        });
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;
            const status = document.getElementById('form-status');
            const lang = languageSelector.value;

            fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    status.textContent = lang === 'it' ? 'Grazie! Il tuo messaggio è stato inviato.' : 'Thanks! Your message has been sent.';
                    status.className = 'form-status success-message';
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            status.textContent = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            status.textContent = lang === 'it' ? 'Oops! C\'è stato un problema.' : 'Oops! There was a problem submitting your form.';
                        }
                        status.className = 'form-status error-message';
                    });
                }
            }).catch(error => {
                status.textContent = lang === 'it' ? 'Oops! C\'è stato un problema.' : 'Oops! There was a problem submitting your form.';
                status.className = 'form-status error-message';
            });
        });
    }

    // Back to Top Button Logic
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
