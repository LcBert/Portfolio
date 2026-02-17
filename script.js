document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const languageSelector = document.getElementById('language-selector');
    let projectsData = [];

    // Load projects
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            projectsData = projects;
            // Initial render
            const initialLang = languageSelector.value;
            updateStaticContent(initialLang);
            renderProjects(initialLang);
        })
        .catch(error => console.error('Error loading projects:', error));

    // Handle language change
    languageSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        updateStaticContent(lang);
        renderProjects(lang);
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
