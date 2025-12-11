const projectsContainer = document.getElementById('projects-container');

// Function to fetch and display projects
async function loadProjects() {
    try {
        const response = await fetch('projects/projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const projects = data.projects;

        projects.forEach(project => {
            // Create HTML elements for the project
            const card = document.createElement('div');
            card.className = 'project-card';

            const title = document.createElement('h3');
            title.textContent = project.name;

            const description = document.createElement('p');
            description.textContent = project.description;

            const link = document.createElement('a');
            link.href = project.link || '#';
            link.className = 'project-link';
            link.textContent = 'View Project';

            // Append elements to card
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(link);

            // Append card to container
            projectsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadProjects);