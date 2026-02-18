document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const skillsContainer = document.getElementById('skills-container');
    const timelineContainer = document.getElementById('timeline-container');
    const scrollProgress = document.getElementById('scroll-progress');
    const languageSelector = document.getElementById('language-selector');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    let projectsData = [];
    let skillsData = [];
    let timelineData = [];
    let showAllProjects = false;
    const showAllBtn = document.getElementById('show-all-projects');
    const showAllText = document.querySelector('#show-all-projects .show-all-text');
    const showLessText = document.querySelector('#show-all-projects .show-less-text');

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

    // Scroll Spy for Navigation Active State
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateActiveLink() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // logic: if scroll reaches section top minus some offset (e.g. 150px for header + buffer)
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    }

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveLink);
    }
    // Scroll Progress Bar Logic
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + "%";
        }
    });
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

    // Pagination variables
    let currentProjectPage = 1;
    const projectsPerPage = 3;
    const paginationDiv = document.getElementById('projects-pagination');
    const prevBtn = document.getElementById('projects-prev');
    const nextBtn = document.getElementById('projects-next');
    const pageInfo = document.getElementById('projects-page-info');

    const projectSearchInput = document.getElementById('project-search');
    let projectSearchTerm = '';

    if (projectSearchInput) {
        projectSearchInput.addEventListener('input', (e) => {
            projectSearchTerm = e.target.value.trim().toLowerCase();
            currentProjectPage = 1;
            renderProjects(languageSelector.value, document.querySelector('.filter-btn.active').dataset.filter);
        });
    }

    function renderProjects(lang, filter = 'all') {
        projectsContainer.innerHTML = '';
        let filteredProjects = filter === 'all'
            ? projectsData
            : projectsData.filter(p => p.technologies && p.technologies.includes(filter));

        // Apply search filter
        if (projectSearchTerm) {
            filteredProjects = filteredProjects.filter(p =>
                (p.name && p.name.toLowerCase().includes(projectSearchTerm))
            );
        }

        // Pagination logic
        const totalPages = Math.ceil(filteredProjects.length / projectsPerPage) || 1;
        if (currentProjectPage > totalPages) currentProjectPage = totalPages;
        const startIdx = (currentProjectPage - 1) * projectsPerPage;
        const endIdx = startIdx + projectsPerPage;
        let displayProjects = filteredProjects.slice(startIdx, endIdx);

        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = `<p style="text-align:center; width:100%; color: var(--text-muted);">No projects found for ${filter}.</p>`;
            if (paginationDiv) paginationDiv.style.display = 'none';
            return;
        }

        displayProjects.forEach(project => {
            // Change from 'a' to 'div' to support modal behavior
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.style.cursor = 'pointer'; // Make it look clickable

            // Add click listener to open modal
            card.addEventListener('click', () => openProjectModal(project));

            // 3D Tilt Effect logic
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate rotation relative to center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Max rotation: +/- 5 degrees
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                // Remove transition for instant response
                card.style.transition = 'none';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                // Restore transition for smooth return
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });

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
            linkText.textContent = lang === 'it' ? 'Vedi Dettagli →' : 'View Details →';

            card.appendChild(title);
            card.appendChild(techContainer);
            card.appendChild(description);
            card.appendChild(linkText);

            projectsContainer.appendChild(card);

            // Add to observer
            observer.observe(card);
        });

        // Pagination controls
        if (paginationDiv) {
            if (filteredProjects.length > projectsPerPage) {
                paginationDiv.style.display = '';
                if (pageInfo) pageInfo.textContent = `Page ${currentProjectPage} of ${totalPages}`;
                if (prevBtn) prevBtn.disabled = currentProjectPage === 1;
                if (nextBtn) nextBtn.disabled = currentProjectPage === totalPages;
            } else {
                paginationDiv.style.display = 'none';
            }
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentProjectPage > 1) {
                currentProjectPage--;
                renderProjects(languageSelector.value, document.querySelector('.filter-btn.active').dataset.filter);
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentProjectPage++;
            renderProjects(languageSelector.value, document.querySelector('.filter-btn.active').dataset.filter);
        });
    }

    // Modal Logic
    const modal = document.getElementById("project-modal");
    const span = document.getElementsByClassName("close-modal")[0];

    function openProjectModal(project) {
        if (!modal) return;

        const lang = languageSelector.value;
        const modalTitle = document.getElementById("modal-title");
        const modalDesc = document.getElementById("modal-description");
        const modalTech = document.getElementById("modal-tech-stack");
        const repoLink = document.getElementById("modal-repo-link");
        const repoSpan = repoLink ? repoLink.querySelector('span') : null;

        if (modalTitle) modalTitle.textContent = project.name;

        // Use long description if available, else short
        let descText = "";
        if (project.long_description) {
            descText = (typeof project.long_description === 'object') ? (project.long_description[lang] || project.long_description['en']) : project.long_description;
        } else {
            descText = (typeof project.description === 'object') ? (project.description[lang] || project.description['en']) : project.description;
        }

        if (modalDesc) modalDesc.textContent = descText;

        // Populate Tech Stack
        if (modalTech) {
            modalTech.innerHTML = '';
            // Reset margin for modal context
            if (project.technologies) {
                project.technologies.forEach(tech => {
                    const badge = document.createElement('span');
                    badge.className = 'tech-badge';
                    badge.textContent = tech;
                    modalTech.appendChild(badge);
                });
            }
        }

        // Set Link
        if (repoLink) {
            repoLink.href = project.link;
            if (repoSpan) {
                repoSpan.textContent = lang === 'it' ? 'Vedi Codice' : 'View Code';
            }
        }

        modal.style.display = "flex";
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.add("show");
    }

    // Close Modal Logic
    if (span) {
        span.onclick = function () {
            closeModal();
        }
    }

    // Close when clicking outside
    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300); // Wait for transition
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

    // Typing Animation Logic
    const typedTextSpan = document.getElementById('typed-text');

    // Phrases for typing animation
    const typingPhrases = {
        en: ["Software Developer", "Tech Enthusiast", "CS Student"],
        it: ["Sviluppatore Software", "Appassionato di Tech", "Studente di Informatica"]
    };

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    let typingTimeout;

    function type() {
        const lang = languageSelector.value;
        const currentPhrases = typingPhrases[lang] || typingPhrases['en'];

        // Safety check for index
        if (phraseIndex >= currentPhrases.length) phraseIndex = 0;

        const currentPhrase = currentPhrases[phraseIndex];

        if (isDeleting) {
            typedTextSpan.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster when deleting
        } else {
            typedTextSpan.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at full phrase
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % currentPhrases.length;
            typeSpeed = 500; // Pause before starting new phrase
        }

        typingTimeout = setTimeout(type, typeSpeed);
    }

    if (typedTextSpan) {
        type();
    }

    // Initialize Particles.js
    if (document.getElementById('particles-js')) {
        /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
        // We will define config inline to keep it simple without external file
        particlesJS("particles-js", {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
});
