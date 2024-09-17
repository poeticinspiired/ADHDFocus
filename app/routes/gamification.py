from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import User, Badge, UserBadge
from app import db

bp = Blueprint('gamification', __name__)

@bp.route('/api/user/points')
@login_required
def get_user_points():
    try:
        return jsonify({'points': current_user.points})
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching user points'}), 500

@bp.route('/api/user/badges')
@login_required
def get_user_badges():
    try:
        badges = [{'id': ub.badge.id, 'name': ub.badge.name, 'description': ub.badge.description, 'image_url': ub.badge.image_url}
                  for ub in current_user.badges]
        return jsonify({'badges': badges})
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching user badges'}), 500

def award_points(user, points):
    user.points += points
    db.session.commit()

def check_and_award_badge(user, badge_name):
    badge = Badge.query.filter_by(name=badge_name).first()
    if badge and badge not in user.badges:
        user_badge = UserBadge(user_id=user.id, badge_id=badge.id)
        db.session.add(user_badge)
        db.session.commit()
        return badge.name
    return None

# Add more functions for specific achievements and badges as needed
