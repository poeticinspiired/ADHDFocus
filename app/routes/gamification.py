from flask import Blueprint, jsonify
from app.models import Badge
from app import db

bp = Blueprint('gamification', __name__)

@bp.route('/api/badges')
def get_badges():
    try:
        badges = [{'id': badge.id, 'name': badge.name, 'description': badge.description, 'image_url': badge.image_url}
                  for badge in Badge.query.all()]
        return jsonify({'badges': badges})
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching badges'}), 500

def check_and_award_badge(badge_name):
    badge = Badge.query.filter_by(name=badge_name).first()
    if badge:
        return badge.name
    return None

# Add more functions for specific achievements and badges as needed
