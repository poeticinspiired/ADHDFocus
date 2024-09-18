// Function to load habits
function loadHabits() {
    fetch('/api/habits')
        .then(response => response.json())
        .then(habits => {
            const habitList = document.getElementById('habit-list');
            habitList.innerHTML = '';
            habits.forEach((habit, index) => {
                const habitElement = createHabitElement(habit);
                habitElement.style.animationDelay = `${index * 0.1}s`;
                habitList.appendChild(habitElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to create a habit element
function createHabitElement(habit) {
    const habitElement = document.createElement('div');
    habitElement.className = 'habit-item slide-in';
    habitElement.innerHTML = `
        <div class="habit-info">
            <h3 class="habit-name text-lg font-semibold">${habit.name}</h3>
            <p class="text-gray-600 dark:text-gray-400">Frequency: ${habit.frequency}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Streak: ${habit.streak} days</p>
        </div>
        <div class="habit-progress">
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${(habit.streak / 30) * 100}%"></div>
            </div>
        </div>
        <div class="habit-actions">
            <button onclick="completeHabit(${habit.id})" class="btn btn-success btn-action">Complete</button>
            <button onclick="editHabit(${habit.id})" class="btn btn-info btn-action">Edit</button>
            <button onclick="deleteHabit(${habit.id})" class="btn btn-error btn-action">Delete</button>
        </div>
    `;
    return habitElement;
}

// Function to add a new habit
function addHabit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const habit = Object.fromEntries(formData.entries());

    fetch('/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        form.reset();
        loadHabits();
        showNotification('Habit created successfully!', 'success');
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error creating habit. Please try again.', 'error');
    });
}

// Function to complete a habit
function completeHabit(habitId) {
    fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadHabits();
        showNotification('Habit completed for today!', 'success');
        if (data.badge_earned) {
            showNotification(`Congratulations! You've earned the "${data.badge_earned}" badge!`, 'info');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error completing habit. Please try again.', 'error');
    });
}

// Function to edit a habit
function editHabit(habitId) {
    // Implement edit functionality
    console.log('Edit habit:', habitId);
    showNotification('Edit functionality coming soon!', 'info');
}

// Function to delete a habit
function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        fetch(`/api/habits/${habitId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadHabits();
            showNotification('Habit deleted successfully!', 'success');
        })
        .catch((error) => {
            console.error('Error:', error);
            showNotification('Error deleting habit. Please try again.', 'error');
        });
    }
}

// Function to show notification
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadHabits();
    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', addHabit);
    }
});
