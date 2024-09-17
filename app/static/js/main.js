// Add your custom JavaScript here
console.log('ADHD Focus App loaded');

// Function to update user points
function updateUserPoints() {
    // Check if the user is authenticated
    const userPointsElement = document.getElementById('user-points');
    if (!userPointsElement) {
        console.log('User is not authenticated. Skipping points update.');
        return;
    }

    fetch('/api/user/points')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('User is not authenticated');
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching user points:', data.error);
                userPointsElement.textContent = 'Error';
            } else {
                userPointsElement.textContent = data.points;
            }
        })
        .catch(error => {
            console.error('Error fetching user points:', error);
            if (error.message === 'User is not authenticated') {
                userPointsElement.textContent = 'N/A';
            } else {
                userPointsElement.textContent = 'Error';
            }
        });
}

// Function to load and display badges
function loadBadges() {
    fetch('/api/user/badges')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('User is not authenticated');
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching badges:', data.error);
                return;
            }
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
        .catch(error => {
            console.error('Error fetching badges:', error);
            const badgesContainer = document.getElementById('badges-container');
            badgesContainer.innerHTML = '<p>Error loading badges</p>';
        });
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
