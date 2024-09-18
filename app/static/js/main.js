document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        updateThemeIcons();
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });

    // Check for saved theme preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        body.classList.add('dark-mode');
    }
    updateThemeIcons();

    // Fetch user progress data and update the dashboard
    fetchUserProgress();
    
    // Set up interval to fetch user progress every 5 minutes
    setInterval(fetchUserProgress, 300000);

    // Load and display a daily quote
    loadDailyQuote();

    // Initialize 3D elements
    initDashboard3D();

    // Add smooth scrolling to navigation links
    addSmoothScrolling();
});

function updateThemeIcons() {
    const body = document.body;
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');

    if (body.classList.contains('dark-mode')) {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    } else {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
    }
}

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

        // Update 3D visualization
        updateDashboard3D(data);

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
        gsap.to(progressBar, {
            width: `${value}%`,
            duration: 1,
            ease: 'power2.out'
        });
    } else {
        console.warn(`Progress bar element not found: ${id}`);
    }
}

function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
        gsap.from(element, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'back.out'
        });
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
        gsap.from([moodIcon, moodText], {
            scale: 0.5,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out',
            stagger: 0.1
        });
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
            badge.className = 'achievement-badge';
            badge.innerHTML = `<i class="fas fa-trophy"></i>${achievement}`;
            achievementsContainer.appendChild(badge);
            gsap.from(badge, {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out',
                delay: index * 0.1
            });
        });
    } else {
        console.warn('Achievements container not found');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    gsap.fromTo(notification, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: () => {
            setTimeout(() => {
                gsap.to(notification, { 
                    y: 50, 
                    opacity: 0, 
                    duration: 0.5, 
                    ease: 'power2.in',
                    onComplete: () => notification.remove()
                });
            }, 3000);
        }}
    );
}

function loadDailyQuote() {
    const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Believe you can and you're halfway there. - Theodore Roosevelt",
        "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
    ];
    const quoteElement = document.getElementById('daily-quote');
    if (quoteElement) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = randomQuote;
        gsap.from(quoteElement, {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    }
}

let scene, camera, renderer, cube;

function initDashboard3D() {
    const container = document.getElementById('dashboard-3d-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
    camera.position.z = 5;

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function updateDashboard3D(data) {
    if (!cube) return;

    // Update cube color based on overall progress
    const totalProgress = (data.tasks_completed + data.habits_completed + (data.focus_minutes / 60)) / 3;
    const hue = totalProgress * 120 / 100; // 0 to 120 (red to green)
    cube.material.color.setHSL(hue / 360, 1, 0.5);

    // Update cube size based on achievements
    const scale = 1 + (data.achievements.length * 0.1);
    gsap.to(cube.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 1,
        ease: 'elastic.out(1, 0.3)'
    });
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function animateUpdatedElements() {
    gsap.from('.card', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}
