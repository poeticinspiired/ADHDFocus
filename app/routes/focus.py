from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from app.routes.gamification import award_points, check_and_award_badge

bp = Blueprint('focus', __name__)

@bp.route('/focus')
@login_required
def focus():
    return render_template('focus.html')

@bp.route('/api/focus/start', methods=['POST'])
@login_required
def start_focus_session():
    # In a real application, you might want to store focus sessions in the database
    return jsonify({"message": "Focus session started"})

@bp.route('/api/focus/end', methods=['POST'])
@login_required
def end_focus_session():
    # In a real application, you might want to store focus sessions in the database
    data = request.json
    duration = data.get('duration', 0)  # Duration in minutes
    
    points_earned = duration // 5  # Award 1 point for every 5 minutes of focus
    award_points(current_user, points_earned)
    
    if duration >= 25:
        check_and_award_badge(current_user, "Focus Champion")
    
    return jsonify({
        "message": "Focus session ended",
        "points_earned": points_earned
    })
