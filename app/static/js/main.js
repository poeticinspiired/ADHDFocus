document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });

    // Check for saved theme preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        body.classList.add('dark-mode');
    }

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
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
            updateDashboard(data);
        })
        .catch(error => {
            console.error('Error fetching user progress:', error);
            showNotification('Error loading dashboard data. Please try again later.');
        });
});

function updateDashboard(data) {
    updateProgressBar('tasks-progress', data.tasks_completed);
    updateProgressBar('habits-progress', data.habits_completed);
    updateProgressBar('focus-progress', data.focus_minutes / 60 * 100);

    updateText('tasks-completed', `${data.tasks_completed}% completed`);
    updateText('habits-completed', `${data.habits_completed}% completed`);
    updateText('focus-minutes', `${data.focus_minutes} minutes focused today`);

    updateMoodIcon(data.last_mood_icon, data.last_mood);
    updateAchievements(data.achievements);
}

function updateProgressBar(id, value) {
    const progressBar = document.getElementById(id);
    if (progressBar) {
        progressBar.style.width = `${value}%`;
    }
}

function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function updateMoodIcon(iconName, mood) {
    const moodIcon = document.getElementById('mood-icon');
    const moodText = document.getElementById('mood-text');
    if (moodIcon && moodText) {
        moodIcon.className = `fas fa-${iconName}`;
        moodText.textContent = `Last mood: ${mood}`;
    }
}

function updateAchievements(achievements) {
    const achievementsContainer = document.getElementById('achievements');
    if (achievementsContainer) {
        achievementsContainer.innerHTML = '';
        achievements.forEach(achievement => {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = achievement;
            achievementsContainer.appendChild(badge);
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
