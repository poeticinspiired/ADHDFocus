let taskScene, taskCamera, taskRenderer, taskCube;

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    initTask3D();

    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', addTask);
    }
});

function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const taskElement = createTaskElement(task);
                gsap.from(taskElement, {
                    opacity: 0,
                    y: 20,
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                taskList.appendChild(taskElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error loading tasks. Please try again.', 'error');
        });
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item card p-4 mb-4 transform hover:scale-105 transition-all duration-300';
    taskElement.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="task-title text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : ''}">${task.title}</h3>
            <span class="task-priority px-2 py-1 rounded-full text-xs font-bold ${getPriorityClass(task.priority)}">${getPriorityLabel(task.priority)}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-2">${task.description || 'No description'}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Due: ${formatDate(task.due_date) || 'No due date'}</p>
        <div class="task-actions flex justify-end space-x-2">
            <button onclick="toggleTaskCompletion(${task.id})" class="btn ${task.completed ? 'btn-warning' : 'btn-success'} btn-sm">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'} mr-1"></i>${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button onclick="editTask(${task.id})" class="btn btn-info btn-sm">
                <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button onclick="deleteTask(${task.id})" class="btn btn-error btn-sm">
                <i class="fas fa-trash-alt mr-1"></i>Delete
            </button>
        </div>
    `;
    return taskElement;
}

function getPriorityLabel(priority) {
    switch (priority) {
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        default: return 'Unknown';
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case 1: return 'bg-green-200 text-green-800';
        case 2: return 'bg-yellow-200 text-yellow-800';
        case 3: return 'bg-red-200 text-red-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function addTask(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const task = Object.fromEntries(formData.entries());

    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        form.reset();
        loadTasks();
        showNotification('Task added successfully!', 'success');
        animateTaskAddition();
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error adding task. Please try again.', 'error');
    });
}

function toggleTaskCompletion(taskId) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadTasks();
        showNotification('Task status updated!', 'success');
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error updating task status. Please try again.', 'error');
    });
}

function editTask(taskId) {
    // Implement edit functionality
    console.log('Edit task:', taskId);
    showNotification('Edit functionality coming soon!', 'info');
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadTasks();
            showNotification('Task deleted successfully!', 'success');
        })
        .catch((error) => {
            console.error('Error:', error);
            showNotification('Error deleting task. Please try again.', 'error');
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

function initTask3D() {
    const container = document.getElementById('task-3d-container');
    
    taskScene = new THREE.Scene();
    taskCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    taskRenderer = new THREE.WebGLRenderer({ alpha: true });
    
    taskRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(taskRenderer.domElement);
    
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true });
    taskCube = new THREE.Mesh(geometry, material);
    
    taskScene.add(taskCube);
    taskCamera.position.z = 5;
    
    animateTask3D();
}

function animateTask3D() {
    requestAnimationFrame(animateTask3D);
    taskCube.rotation.x += 0.01;
    taskCube.rotation.y += 0.01;
    taskRenderer.render(taskScene, taskCamera);
}

function animateTaskAddition() {
    gsap.to(taskCube.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        onComplete: () => {
            gsap.to(taskCube.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        }
    });
}
