from flask import Blueprint, render_template, request, jsonify
from app.models import Task
from app import db

bp = Blueprint('tasks', __name__)

@bp.route('/tasks')
def tasks():
    return render_template('tasks.html')

@bp.route('/api/tasks', methods=['GET', 'POST'])
def api_tasks():
    if request.method == 'POST':
        data = request.json
        new_task = Task(
            title=data['title'],
            description=data.get('description', ''),
            due_date=data.get('due_date'),
            priority=data.get('priority', 1)
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created successfully", "id": new_task.id}), 201
    else:
        tasks = Task.query.all()
        return jsonify([{
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "due_date": task.due_date,
            "priority": task.priority,
            "completed": task.completed
        } for task in tasks])

@bp.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def api_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    if request.method == 'PUT':
        data = request.json
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.due_date = data.get('due_date', task.due_date)
        task.priority = data.get('priority', task.priority)
        task.completed = data.get('completed', task.completed)
        db.session.commit()
        return jsonify({"message": "Task updated successfully"})
    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"})
