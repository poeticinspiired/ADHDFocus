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
            updateProgressBar('tasks-progress', data.tasks_completed);
            updateProgressBar('habits-progress', data.habits_completed);
            updateProgressBar('focus-progress', data.focus_minutes / 60 * 100); // Assuming 60 minutes is 100%

            const tasksCompleted = document.querySelector('#tasks-progress').nextElementSibling;
            tasksCompleted.textContent = `${data.tasks_completed}% completed`;

            const habitsCompleted = document.querySelector('#habits-progress').nextElementSibling;
            habitsCompleted.textContent = `${data.habits_completed}% completed`;

            const focusMinutes = document.querySelector('#focus-progress').nextElementSibling;
            focusMinutes.textContent = `${data.focus_minutes} minutes focused today`;

            // Update mood icon
            const moodIcons = document.getElementById('mood-icons');
            moodIcons.innerHTML = '';
            const moodIcon = document.createElement('i');
            moodIcon.className = `fas fa-${data.last_mood_icon} mood-icon`;
            moodIcons.appendChild(moodIcon);

            const lastMood = moodIcons.nextElementSibling;
            lastMood.textContent = `Last mood: ${data.last_mood}`;

            // Add achievement badges
            const achievements = document.getElementById('achievements');
            achievements.innerHTML = '';
            data.achievements.forEach(achievement => {
                achievements.appendChild(createBadge(achievement));
            });
        })
        .catch(error => {
            console.error('Error fetching user progress:', error);
            showNotification('Error loading dashboard data. Please try again later.');
        });
});

// Function to update progress bars
function updateProgressBar(elementId, progress) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// Function to create a badge
function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    return badge;
}

// Function to show a notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
