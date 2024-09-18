from flask import Blueprint, render_template, request, jsonify
from app.models import Habit
from app import db
from app.routes.gamification import check_and_award_badge

bp = Blueprint('habits', __name__)

@bp.route('/habits')
def habits():
    return render_template('habits.html')

@bp.route('/api/habits', methods=['GET', 'POST'])
def api_habits():
    if request.method == 'POST':
        data = request.json
        new_habit = Habit(
            name=data['name'],
            frequency=data['frequency']
        )
        db.session.add(new_habit)
        db.session.commit()
        return jsonify({"message": "Habit created successfully", "id": new_habit.id}), 201
    else:
        habits = Habit.query.all()
        return jsonify([{
            "id": habit.id,
            "name": habit.name,
            "frequency": habit.frequency,
            "streak": habit.streak
        } for habit in habits])

@bp.route('/api/habits/<int:habit_id>', methods=['PUT', 'DELETE'])
def api_habit(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    
    if request.method == 'PUT':
        data = request.json
        habit.name = data.get('name', habit.name)
        habit.frequency = data.get('frequency', habit.frequency)
        db.session.commit()
        return jsonify({"message": "Habit updated successfully"})
    elif request.method == 'DELETE':
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Habit deleted successfully"})

@bp.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
def complete_habit(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    
    habit.streak += 1
    db.session.commit()
    
    badge_earned = None
    if habit.streak == 7:
        badge_earned = check_and_award_badge("Week Warrior")
    elif habit.streak == 30:
        badge_earned = check_and_award_badge("Monthly Master")
    elif habit.streak == 365:
        badge_earned = check_and_award_badge("Yearly Champion")
    
    return jsonify({
        "message": "Habit completed successfully",
        "new_streak": habit.streak,
        "badge_earned": badge_earned
    })
