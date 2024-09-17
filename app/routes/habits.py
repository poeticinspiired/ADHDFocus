from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app.models import Habit
from app import db

bp = Blueprint('habits', __name__)

@bp.route('/habits')
@login_required
def habits():
    return render_template('habits.html')

@bp.route('/api/habits', methods=['GET', 'POST'])
@login_required
def api_habits():
    if request.method == 'POST':
        data = request.json
        new_habit = Habit(
            name=data['name'],
            frequency=data['frequency'],
            user_id=current_user.id
        )
        db.session.add(new_habit)
        db.session.commit()
        return jsonify({"message": "Habit created successfully", "id": new_habit.id}), 201
    else:
        habits = Habit.query.filter_by(user_id=current_user.id).all()
        return jsonify([{
            "id": habit.id,
            "name": habit.name,
            "frequency": habit.frequency,
            "streak": habit.streak
        } for habit in habits])

@bp.route('/api/habits/<int:habit_id>', methods=['PUT', 'DELETE'])
@login_required
def api_habit(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    if habit.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    if request.method == 'PUT':
        data = request.json
        habit.name = data.get('name', habit.name)
        habit.frequency = data.get('frequency', habit.frequency)
        habit.streak = data.get('streak', habit.streak)
        db.session.commit()
        return jsonify({"message": "Habit updated successfully"})
    elif request.method == 'DELETE':
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Habit deleted successfully"})
