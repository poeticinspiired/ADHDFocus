from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app.models import Habit
from app import db
from app.routes.gamification import award_points, check_and_award_badge

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
        db.session.commit()
        return jsonify({"message": "Habit updated successfully"})
    elif request.method == 'DELETE':
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"message": "Habit deleted successfully"})

@bp.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
@login_required
def complete_habit(habit_id):
    habit = Habit.query.get_or_404(habit_id)
    if habit.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    habit.streak += 1
    db.session.commit()
    
    points_earned = 5  # Base points for completing a habit
    if habit.streak % 7 == 0:  # Extra points for weekly streaks
        points_earned += 20
    
    award_points(current_user, points_earned)
    
    badge_earned = None
    if habit.streak == 7:
        badge_earned = check_and_award_badge(current_user, "Week Warrior")
    elif habit.streak == 30:
        badge_earned = check_and_award_badge(current_user, "Monthly Master")
    elif habit.streak == 365:
        badge_earned = check_and_award_badge(current_user, "Yearly Champion")
    
    return jsonify({
        "message": "Habit completed successfully",
        "points_earned": points_earned,
        "new_streak": habit.streak,
        "badge_earned": badge_earned
    })
