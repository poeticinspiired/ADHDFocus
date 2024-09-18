document.addEventListener('DOMContentLoaded', function() {
    console.log('ADHD Focus App loaded');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });

    // Check for saved theme preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        body.classList.add('dark-mode');
    }

    // Add yellow highlight to current page in navigation
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('text-yellow-500');
            link.classList.add('bg-yellow-100');
        }
    });

    // Fetch user progress data and update the dashboard
    fetch('/api/user_progress')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            try {
                // Update progress bars
                updateProgressBarIfExists('tasks-progress', data.tasks_completed);
                updateProgressBarIfExists('habits-progress', data.habits_completed);
                updateProgressBarIfExists('focus-progress', data.focus_minutes / 60 * 100);

                // Update text content
                updateTextContentIfExists('#tasks-progress', `${data.tasks_completed}% completed`);
                updateTextContentIfExists('#habits-progress', `${data.habits_completed}% completed`);
                updateTextContentIfExists('#focus-progress', `${data.focus_minutes} minutes focused today`);

                // Update mood icon
                updateMoodIcon(data.last_mood_icon, data.last_mood);

                // Add achievement badges
                updateAchievements(data.achievements);

                // Add fade-in animation
                addFadeInAnimation();
            } catch (error) {
                console.error('Error updating UI:', error);
                showNotification('Error updating dashboard. Some information may be missing.');
            }
        })
        .catch(error => {
            console.error('Error fetching user progress:', error);
            showNotification('Error loading dashboard data. Please try again later.');
        });

    // Add slide-in animation to cards on scroll
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        observer.observe(card);
    });
});

// Helper functions
function updateProgressBarIfExists(elementId, progress) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    } else {
        console.warn(`Progress bar element ${elementId} not found`);
    }
}

function updateTextContentIfExists(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element ${selector} not found`);
    }
}

function updateMoodIcon(iconName, moodText) {
    const moodIcons = document.getElementById('mood-icons');
    const lastMood = document.querySelector('#mood-icons + p');
    if (moodIcons && lastMood) {
        moodIcons.innerHTML = '';
        const moodIcon = document.createElement('i');
        moodIcon.className = `fas fa-${iconName} mood-icon`;
        moodIcons.appendChild(moodIcon);
        lastMood.textContent = `Last mood: ${moodText}`;
    } else {
        console.warn('Mood icon elements not found');
    }
}

function updateAchievements(achievements) {
    const achievementsContainer = document.getElementById('achievements');
    if (achievementsContainer) {
        achievementsContainer.innerHTML = '';
        achievements.forEach(achievement => {
            achievementsContainer.appendChild(createBadge(achievement));
        });
    } else {
        console.warn('Achievements container not found');
    }
}

function addFadeInAnimation() {
    document.querySelectorAll('.card, .progress-bar, #mood-icons, #achievements').forEach(el => {
        if (el) {
            el.classList.add('fade-in');
        }
    });
}

function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    return badge;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg shadow-lg fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('fade-in');
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
