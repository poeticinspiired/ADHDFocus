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
    fetchUserProgress();
    
    // Set up interval to fetch user progress every 5 minutes
    setInterval(fetchUserProgress, 300000);
});

function fetchUserProgress() {
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
}

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

        // Add animations to newly updated elements
        animateUpdatedElements();
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Error updating dashboard. Please refresh the page.', 'error');
    }
}

function updateProgressBar(id, value) {
    const progressBar = document.getElementById(id);
    if (progressBar) {
        progressBar.style.width = `${value}%`;
        progressBar.style.transition = 'width 1s ease-in-out';
    } else {
        console.warn(`Progress bar element not found: ${id}`);
    }
}

function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
        element.classList.add('updated');
    } else {
        console.warn(`Text element not found: ${id}`);
    }
}

function updateMoodIcon(iconName, mood) {
    const moodIcon = document.getElementById('mood-icon');
    const moodText = document.getElementById('mood-text');
    if (moodIcon && moodText) {
        moodIcon.innerHTML = `<i class="fas fa-${iconName}"></i>`;
        moodText.textContent = `Last mood: ${mood}`;
        moodIcon.classList.add('updated');
        moodText.classList.add('updated');
    } else {
        console.warn('Mood elements not found');
    }
}

function updateAchievements(achievements) {
    const achievementsContainer = document.getElementById('achievements');
    if (achievementsContainer) {
        achievementsContainer.innerHTML = '';
        achievements.forEach((achievement, index) => {
            const badge = document.createElement('span');
            badge.className = 'badge slide-in';
            badge.style.animationDelay = `${index * 0.1}s`;
            badge.textContent = achievement;
            achievementsContainer.appendChild(badge);
        });
    } else {
        console.warn('Achievements container not found');
    }
}

function animateUpdatedElements() {
    const updatedElements = document.querySelectorAll('.updated');
    updatedElements.forEach(element => {
        element.classList.add('animate-update');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate-update', 'updated');
        }, { once: true });
    });
}

function showNotification(message, type) {
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
}

// Add more interactive features and animations as needed
