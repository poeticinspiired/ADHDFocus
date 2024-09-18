from flask import Blueprint, render_template, jsonify
from app.models import Mood, Task
from sqlalchemy import func
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
import logging

bp = Blueprint('insights', __name__)

@bp.route('/insights')
def insights():
    return render_template('insights.html')

@bp.route('/api/insights')
def get_insights():
    try:
        # Get mood data for the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        moods = Mood.query.filter(Mood.created_at >= thirty_days_ago).all()

        # Get task data for the last 30 days
        tasks = Task.query.filter(Task.created_at >= thirty_days_ago).all()

        # Generate insights
        insights = []

        # Mood-related insights
        if moods:
            avg_mood = sum(int(mood.mood) for mood in moods) / len(moods)
            insights.append(f"The average mood over the last 30 days is {avg_mood:.2f} out of 10.")

            mood_energy_correlation = calculate_mood_energy_correlation(moods)
            if mood_energy_correlation > 0.5:
                insights.append("There's a strong positive correlation between mood and energy levels. Consider focusing on activities that boost energy to improve overall mood.")
            elif mood_energy_correlation < -0.5:
                insights.append("There's a strong negative correlation between mood and energy levels. Explore relaxation techniques to balance energy and improve mood.")

        # Task-related insights
        if tasks:
            completed_tasks = [task for task in tasks if task.completed]
            completion_rate = len(completed_tasks) / len(tasks) * 100 if tasks else 0
            insights.append(f"The task completion rate over the last 30 days is {completion_rate:.2f}%.")

            if completion_rate < 50:
                insights.append("Consider breaking down tasks into smaller, more manageable steps to improve the completion rate.")
            elif completion_rate > 80:
                insights.append("Great job on completing tasks! Keep up the good work and challenge yourself with more complex goals.")

        # Combine mood and task insights
        if moods and tasks:
            productive_mood = find_most_productive_mood(moods, tasks)
            if productive_mood:
                insights.append(f"The most productive mood seems to be around {productive_mood:.2f}. Try to create environments that foster this mood to boost productivity.")

        logging.info(f"Generated insights: {insights}")
        return jsonify(insights)
    except SQLAlchemyError as e:
        logging.error(f"Database error in get_insights: {str(e)}")
        return jsonify({'error': 'Database error', 'message': 'An error occurred while fetching insights'}), 500
    except Exception as e:
        logging.error(f"Unexpected error in get_insights: {str(e)}")
        return jsonify({'error': 'Unexpected error', 'message': 'An unexpected error occurred'}), 500

def calculate_mood_energy_correlation(moods):
    if len(moods) < 2:
        return 0
    mood_values = [int(mood.mood) for mood in moods]
    energy_values = [int(mood.energy_level) for mood in moods]
    mean_mood = sum(mood_values) / len(mood_values)
    mean_energy = sum(energy_values) / len(energy_values)
    numerator = sum((m - mean_mood) * (e - mean_energy) for m, e in zip(mood_values, energy_values))
    denominator = (sum((m - mean_mood) ** 2 for m in mood_values) * sum((e - mean_energy) ** 2 for e in energy_values)) ** 0.5
    return numerator / denominator if denominator != 0 else 0

def find_most_productive_mood(moods, tasks):
    mood_productivity = {}
    for mood in moods:
        tasks_on_day = [task for task in tasks if task.created_at.date() == mood.created_at.date()]
        completed_tasks = [task for task in tasks_on_day if task.completed]
        if tasks_on_day:
            productivity = len(completed_tasks) / len(tasks_on_day)
            mood_value = int(mood.mood)
            if mood_value in mood_productivity:
                mood_productivity[mood_value].append(productivity)
            else:
                mood_productivity[mood_value] = [productivity]
    
    if not mood_productivity:
        return None
    
    avg_productivity = {mood: sum(productivities) / len(productivities) for mood, productivities in mood_productivity.items()}
    return max(avg_productivity, key=avg_productivity.get)
