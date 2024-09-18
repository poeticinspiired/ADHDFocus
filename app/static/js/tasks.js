// Function to load tasks
function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const taskElement = createTaskElement(task);
                taskElement.style.animationDelay = `${index * 0.1}s`;
                taskList.appendChild(taskElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to create a task element
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item slide-in';
    taskElement.innerHTML = `
        <div>
            <h3 class="task-title text-lg font-semibold ${task.completed ? 'line-through' : ''}">${task.title}</h3>
            <p class="text-gray-600 dark:text-gray-400">${task.description || 'No description'}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Due: ${task.due_date || 'No due date'}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Priority: ${getPriorityLabel(task.priority)}</p>
        </div>
        <div class="task-actions">
            <button onclick="toggleTaskCompletion(${task.id})" class="btn ${task.completed ? 'btn-warning' : 'btn-success'} btn-action">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button onclick="editTask(${task.id})" class="btn btn-info btn-action">Edit</button>
            <button onclick="deleteTask(${task.id})" class="btn btn-error btn-action">Delete</button>
        </div>
    `;
    return taskElement;
}

// Function to get priority label
function getPriorityLabel(priority) {
    switch (priority) {
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        default: return 'Unknown';
    }
}

// Function to add a new task
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
    })
    .catch((error) => {
        console.error('Error:', error);
        showNotification('Error adding task. Please try again.', 'error');
    });
}

// Function to toggle task completion
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

// Function to edit a task
function editTask(taskId) {
    // Implement edit functionality
    console.log('Edit task:', taskId);
    showNotification('Edit functionality coming soon!', 'info');
}

// Function to delete a task
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
    loadTasks();
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', addTask);
    }
});
