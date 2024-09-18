// Function to load habits
function loadHabits() {
    fetch('/api/habits')
        .then(response => response.json())
        .then(habits => {
            const habitList = document.getElementById('habit-list');
            habitList.innerHTML = '';
            habits.forEach(habit => {
                const habitElement = createHabitElement(habit);
                habitList.appendChild(habitElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to create a habit element
function createHabitElement(habit) {
    const habitElement = document.createElement('div');
    habitElement.className = 'card';
    habitElement.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">${habit.name}</h3>
        <p class="text-gray-600 dark:text-gray-400">Frequency: ${habit.frequency}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Streak: ${habit.streak} days</p>
        <div class="mt-4 flex justify-between items-center">
            <button class="btn" onclick="completeHabit(${habit.id})">Complete</button>
            <button class="btn btn-delete" onclick="deleteHabit(${habit.id})">Delete</button>
        </div>
        <div class="mt-2 progress-bar">
            <div class="progress-bar-fill" style="width: ${(habit.streak / 30) * 100}%"></div>
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
    })
    .catch((error) => {
        console.error('Error:', error);
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
        if (data.badge_earned) {
            alert(`Congratulations! You've earned the "${data.badge_earned}" badge!`);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
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
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadHabits();
    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', addHabit);
    }
});
