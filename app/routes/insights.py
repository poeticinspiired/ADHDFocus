from flask import Blueprint, render_template, jsonify
from flask_login import login_required, current_user
from app.models import Mood, Task
from sqlalchemy import func
from datetime import datetime, timedelta

bp = Blueprint('insights', __name__)

@bp.route('/insights')
@login_required
def insights():
    return render_template('insights.html')

@bp.route('/api/insights')
@login_required
def get_insights():
    # Get mood data for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    moods = Mood.query.filter(Mood.user_id == current_user.id, Mood.created_at >= thirty_days_ago).all()

    # Get task data for the last 30 days
    tasks = Task.query.filter(Task.user_id == current_user.id, Task.created_at >= thirty_days_ago).all()

    # Generate insights
    insights = []

    # User points insight
    insights.append(f"You currently have {current_user.points} points. Keep up the good work!")

    # Mood-related insights
    if moods:
        avg_mood = sum(mood.mood for mood in moods) / len(moods)
        insights.append(f"Your average mood over the last 30 days is {avg_mood:.2f} out of 10.")

        mood_energy_correlation = calculate_mood_energy_correlation(moods)
        if mood_energy_correlation > 0.5:
            insights.append("There's a strong positive correlation between your mood and energy levels. Consider focusing on activities that boost your energy to improve your overall mood.")
        elif mood_energy_correlation < -0.5:
            insights.append("There's a strong negative correlation between your mood and energy levels. You might want to explore relaxation techniques to balance your energy and improve your mood.")

    # Task-related insights
    if tasks:
        completed_tasks = [task for task in tasks if task.completed]
        completion_rate = len(completed_tasks) / len(tasks) * 100
        insights.append(f"Your task completion rate over the last 30 days is {completion_rate:.2f}%.")

        if completion_rate < 50:
            insights.append("Consider breaking down your tasks into smaller, more manageable steps to improve your completion rate.")
        elif completion_rate > 80:
            insights.append("Great job on completing your tasks! Keep up the good work and challenge yourself with more complex goals.")

    # Combine mood and task insights
    if moods and tasks:
        productive_mood = find_most_productive_mood(moods, tasks)
        if productive_mood:
            insights.append(f"You seem to be most productive when your mood is around {productive_mood:.2f}. Try to create environments that foster this mood to boost your productivity.")

    return jsonify(insights)

def calculate_mood_energy_correlation(moods):
    if len(moods) < 2:
        return 0
    mood_values = [mood.mood for mood in moods]
    energy_values = [mood.energy_level for mood in moods]
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
            if mood.mood in mood_productivity:
                mood_productivity[mood.mood].append(productivity)
            else:
                mood_productivity[mood.mood] = [productivity]
    
    if not mood_productivity:
        return None
    
    avg_productivity = {mood: sum(productivities) / len(productivities) for mood, productivities in mood_productivity.items()}
    return max(avg_productivity, key=avg_productivity.get)
