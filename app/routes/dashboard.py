from flask import Blueprint, jsonify
from app.models import Task, Habit, Mood
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
import logging

bp = Blueprint('dashboard', __name__)

@bp.route('/api/user_progress')
def user_progress():
    try:
        # Get tasks progress
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(completed=True).count()
        tasks_completed = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)

        # Get habits progress
        total_habits = Habit.query.count()
        completed_habits = Habit.query.filter(Habit.streak > 0).count()
        habits_completed = round((completed_habits / total_habits * 100) if total_habits > 0 else 0, 2)

        # Get focus minutes for today
        today = datetime.now().date()
        focus_minutes = 0  # You'll need to implement a way to track focus sessions

        # Get last mood
        last_mood = Mood.query.order_by(Mood.created_at.desc()).first()
        mood_icon = 'meh'
        mood_text = 'Not set'
        if last_mood:
            mood_value = int(last_mood.mood)
            mood_icon = 'smile' if mood_value >= 7 else 'meh' if mood_value >= 4 else 'frown'
            mood_text = f"{mood_value}/10"

        # Get achievements (this is a placeholder, you'll need to implement an achievement system)
        achievements = ['Task Master', 'Habit Hero', 'Focus Champion']

        response_data = {
            'tasks_completed': tasks_completed,
            'habits_completed': habits_completed,
            'focus_minutes': int(focus_minutes),
            'last_mood_icon': mood_icon,
            'last_mood': mood_text,
            'achievements': achievements
        }
        logging.info(f"User progress data: {response_data}")
        return jsonify(response_data), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error in user_progress: {str(e)}")
        return jsonify({'error': 'Database error', 'message': 'An error occurred while fetching user progress'}), 500
    except Exception as e:
        logging.error(f"Unexpected error in user_progress: {str(e)}")
        return jsonify({'error': 'Unexpected error', 'message': 'An unexpected error occurred'}), 500
