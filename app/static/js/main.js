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
    try {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = `${value}%`;
        } else {
            console.warn(`Progress bar element not found: ${id}`);
        }
    } catch (error) {
        console.error(`Error updating progress bar ${id}:`, error);
    }
}

function updateText(id, text) {
    try {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Text element not found: ${id}`);
        }
    } catch (error) {
        console.error(`Error updating text element ${id}:`, error);
    }
}

function updateMoodIcon(iconName, mood) {
    try {
        const moodIcon = document.getElementById('mood-icon');
        const moodText = document.getElementById('mood-text');
        if (moodIcon && moodText) {
            moodIcon.innerHTML = `<i class="fas fa-${iconName}"></i>`;
            moodText.textContent = `Last mood: ${mood}`;
        } else {
            console.warn('Mood elements not found');
        }
    } catch (error) {
        console.error('Error updating mood icon:', error);
    }
}

function updateAchievements(achievements) {
    try {
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
            console.warn('Achievements container not found');
        }
    } catch (error) {
        console.error('Error updating achievements:', error);
    }
}

function showNotification(message, type) {
    try {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}
