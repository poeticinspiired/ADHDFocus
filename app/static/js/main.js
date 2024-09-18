document.addEventListener('DOMContentLoaded', function() {
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
            showNotification('Error loading dashboard data. Please try again later.', 'error');
        });
});

function updateDashboard(data) {
    console.log('Updating dashboard with data:', data);
    try {
        updateProgressBar('tasks-progress', data.tasks_completed);
        updateProgressBar('habits-progress', data.habits_completed);
        updateProgressBar('focus-progress', data.focus_minutes / 60 * 100);

        updateText('tasks-completed', `${data.tasks_completed}% completed`);
        updateText('habits-completed', `${data.habits_completed}% completed`);
        updateText('focus-minutes', `${data.focus_minutes} minutes focused today`);

        updateMoodIcon(data.last_mood_icon, data.last_mood);
        updateAchievements(data.achievements);
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Error updating dashboard. Please refresh the page.', 'error');
    }
}

function updateProgressBar(id, value) {
    const progressBar = document.getElementById(id);
    if (progressBar) {
        progressBar.style.width = `${value}%`;
    } else {
        console.error(`Progress bar element not found: ${id}`);
    }
}

function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        console.error(`Text element not found: ${id}`);
    }
}

function updateMoodIcon(iconName, mood) {
    const moodIcon = document.getElementById('mood-icon');
    const moodText = document.getElementById('mood-text');
    if (moodIcon && moodText) {
        moodIcon.className = `fas fa-${iconName}`;
        moodText.textContent = `Last mood: ${mood}`;
    } else {
        console.error('Mood elements not found');
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
    } else {
        console.error('Achievements container not found');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
