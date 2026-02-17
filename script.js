document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const skillsContainer = document.getElementById('skills-container');
    const languageSelector = document.getElementById('language-selector');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    let projectsData = [];
    let skillsData = [];

    // Theme Handling logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Load projects and skills in parallel
    Promise.all([
        fetch('projects.json').then(res => res.json()),
        fetch('skills.json').then(res => res.json())
    ])
        .then(([projects, skills]) => {
            projectsData = projects;
            skillsData = skills;
            // Initial render
            const initialLang = languageSelector.value;
            updateStaticContent(initialLang);
            renderProjects(initialLang);
            renderSkills(initialLang);
        })
        .catch(error => console.error('Error loading data:', error));

    // Handle language change
    languageSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        updateStaticContent(lang);
        renderProjects(lang);
        renderSkills(lang);
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
        });
    }

    function renderProjects(lang) {
        projectsContainer.innerHTML = ''; // Clear existing content

        projectsData.forEach(project => {
            const card = document.createElement('a');
            card.href = project.link;
            card.className = 'card';
            card.target = '_blank'; // Open link in new tab

            const title = document.createElement('h2');
            title.textContent = project.name;

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
            card.appendChild(description);
            card.appendChild(linkText);

            projectsContainer.appendChild(card);
        });
    }
});
