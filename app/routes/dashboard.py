from flask import Blueprint, jsonify
from app.models import Task, Habit, Mood
from datetime import datetime, timedelta

bp = Blueprint('dashboard', __name__)

@bp.route('/api/user_progress')
def user_progress():
    # Get tasks progress
    total_tasks = Task.query.count()
    completed_tasks = Task.query.filter_by(completed=True).count()
    tasks_completed = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Get habits progress
    total_habits = Habit.query.count()
    completed_habits = Habit.query.filter(Habit.streak > 0).count()
    habits_completed = (completed_habits / total_habits * 100) if total_habits > 0 else 0

    # Get focus minutes for today
    today = datetime.now().date()
    focus_minutes = 0  # You'll need to implement a way to track focus sessions

    # Get last mood
    last_mood = Mood.query.order_by(Mood.created_at.desc()).first()
    mood_icon = 'meh'
    mood_text = 'Not set'
    if last_mood:
        mood_icon = 'smile' if last_mood.mood >= 7 else 'meh' if last_mood.mood >= 4 else 'frown'
        mood_text = f"{last_mood.mood}/10"

    # Get achievements (this is a placeholder, you'll need to implement an achievement system)
    achievements = ['Task Master', 'Habit Hero', 'Focus Champion']

    return jsonify({
        'tasks_completed': round(tasks_completed, 2),
        'habits_completed': round(habits_completed, 2),
        'focus_minutes': focus_minutes,
        'last_mood_icon': mood_icon,
        'last_mood': mood_text,
        'achievements': achievements
    })
