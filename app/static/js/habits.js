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
    habitElement.className = 'bg-white p-4 rounded-lg shadow-md';
    habitElement.innerHTML = `
        <h3 class="text-lg font-semibold">${habit.name}</h3>
        <p class="text-gray-600">Frequency: ${habit.frequency}</p>
        <p class="text-sm text-gray-500">Streak: ${habit.streak} days</p>
        <button class="mt-2 bg-green-500 text-white px-2 py-1 rounded" onclick="completeHabit(${habit.id})">Complete</button>
        <button class="mt-2 bg-red-500 text-white px-2 py-1 rounded" onclick="deleteHabit(${habit.id})">Delete</button>
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
        updateUserPoints();
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadHabits();
    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', addHabit);
    }
});
