// Function to load tasks
function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to create a task element
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'bg-white p-4 rounded-lg shadow-md';
    taskElement.innerHTML = `
        <h3 class="text-lg font-semibold">${task.title}</h3>
        <p class="text-gray-600">${task.description || 'No description'}</p>
        <p class="text-sm text-gray-500">Due: ${task.due_date || 'No due date'}</p>
        <p class="text-sm text-gray-500">Priority: ${task.priority}</p>
        <div class="mt-2">
            <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}">Completed</label>
        </div>
        <button class="mt-2 bg-red-500 text-white px-2 py-1 rounded" onclick="deleteTask(${task.id})">Delete</button>
    `;

    const checkbox = taskElement.querySelector(`#task-${task.id}`);
    checkbox.addEventListener('change', () => updateTask(task.id, checkbox.checked));

    return taskElement;
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
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to update a task
function updateTask(taskId, completed) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: completed }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        updateUserPoints();
        loadTasks();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to delete a task
function deleteTask(taskId) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadTasks();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', addTask);
    }
});
