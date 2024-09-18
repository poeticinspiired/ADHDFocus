let habitScene, habitCamera, habitRenderer, habitCube;

document.addEventListener('DOMContentLoaded', function() {
    loadHabits();
    initHabit3D();

    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', addHabit);
    }
});

function loadHabits() {
    fetch('/api/habits')
        .then(response => response.json())
        .then(habits => {
            const habitList = document.getElementById('habit-list');
            habitList.innerHTML = '';
            habits.forEach((habit, index) => {
                const habitElement = createHabitElement(habit);
                gsap.from(habitElement, {
                    opacity: 0,
                    y: 20,
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                habitList.appendChild(habitElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error loading habits. Please try again.', 'error');
        });
}

function createHabitElement(habit) {
    const habitElement = document.createElement('div');
    habitElement.className = 'habit-item card p-4 mb-4 transform hover:scale-105 transition-all duration-300';
    habitElement.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="habit-name text-lg font-semibold">${habit.name}</h3>
            <span class="habit-frequency px-2 py-1 rounded-full text-xs font-bold ${getFrequencyClass(habit.frequency)}">${habit.frequency}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-2">Streak: ${habit.streak} days</p>
        <div class="habit-progress mb-4">
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${(habit.streak / 30) * 100}%"></div>
            </div>
        </div>
        <div class="habit-actions flex justify-end space-x-2">
            <button onclick="completeHabit(${habit.id})" class="btn btn-success btn-sm">
                <i class="fas fa-check mr-1"></i>Complete
            </button>
            <button onclick="editHabit(${habit.id})" class="btn btn-info btn-sm">
                <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button onclick="deleteHabit(${habit.id})" class="btn btn-error btn-sm">
                <i class="fas fa-trash-alt mr-1"></i>Delete
            </button>
        </div>
    `;
    return habitElement;
}

function getFrequencyClass(frequency) {
    switch (frequency) {
        case 'daily': return 'bg-green-200 text-green-800';
        case 'weekly': return 'bg-blue-200 text-blue-800';
        case 'monthly': return 'bg-purple-200 text-purple-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}

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
        animateHabitAddition();
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error creating habit. Please try again.', 'error');
    });
}

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

function editHabit(habitId) {
    // Implement edit functionality
    console.log('Edit habit:', habitId);
    showNotification('Edit functionality coming soon!', 'info');
}

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

function initHabit3D() {
    const container = document.getElementById('habit-3d-container');
    
    habitScene = new THREE.Scene();
    habitCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    habitRenderer = new THREE.WebGLRenderer({ alpha: true });
    
    habitRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(habitRenderer.domElement);
    
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    habitCube = new THREE.Mesh(geometry, material);
    
    habitScene.add(habitCube);
    habitCamera.position.z = 30;
    
    animateHabit3D();
}

function animateHabit3D() {
    requestAnimationFrame(animateHabit3D);
    habitCube.rotation.x += 0.01;
    habitCube.rotation.y += 0.01;
    habitRenderer.render(habitScene, habitCamera);
}

function animateHabitAddition() {
    gsap.to(habitCube.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        onComplete: () => {
            gsap.to(habitCube.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        }
    });
}
