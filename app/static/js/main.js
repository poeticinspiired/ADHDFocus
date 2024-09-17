// Add your custom JavaScript here
console.log('ADHD Focus App loaded');

// Function to update user points
function updateUserPoints() {
    fetch('/api/user/points')
        .then(response => response.json())
        .then(data => {
            document.getElementById('user-points').textContent = data.points;
        })
        .catch(error => console.error('Error fetching user points:', error));
}

// Function to load and display badges
function loadBadges() {
    fetch('/api/user/badges')
        .then(response => response.json())
        .then(data => {
            const badgesContainer = document.getElementById('badges-container');
            badgesContainer.innerHTML = '';
            data.badges.forEach(badge => {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'text-center';
                badgeElement.innerHTML = `
                    <img src="${badge.image_url}" alt="${badge.name}" class="w-16 h-16 mx-auto mb-2">
                    <p class="text-sm font-semibold">${badge.name}</p>
                `;
                badgesContainer.appendChild(badgeElement);
            });
        })
        .catch(error => console.error('Error fetching badges:', error));
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const showBadgesButton = document.getElementById('show-badges');
    const badgesModal = document.getElementById('badges-modal');
    const closeBadgesButton = document.getElementById('close-badges');

    if (showBadgesButton) {
        showBadgesButton.addEventListener('click', function(e) {
            e.preventDefault();
            badgesModal.classList.remove('hidden');
            loadBadges();
        });
    }

    if (closeBadgesButton) {
        closeBadgesButton.addEventListener('click', function() {
            badgesModal.classList.add('hidden');
        });
    }

    // Update user points on page load
    updateUserPoints();

    // Update user points every 60 seconds
    setInterval(updateUserPoints, 60000);
});

// Add more custom JavaScript as needed
