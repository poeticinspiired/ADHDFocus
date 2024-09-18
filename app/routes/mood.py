from flask import Blueprint, render_template, request, jsonify
from app.models import Mood
from app import db

bp = Blueprint('mood', __name__)

@bp.route('/mood')
def mood():
    return render_template('mood.html')

@bp.route('/api/moods', methods=['GET', 'POST'])
def api_moods():
    if request.method == 'POST':
        data = request.json
        new_mood = Mood(
            mood=data['mood'],
            energy_level=data['energy_level'],
            notes=data.get('notes', '')
        )
        db.session.add(new_mood)
        db.session.commit()
        return jsonify({"message": "Mood logged successfully", "id": new_mood.id}), 201
    else:
        moods = Mood.query.order_by(Mood.created_at.desc()).limit(30).all()
        return jsonify([{
            "id": mood.id,
            "mood": mood.mood,
            "energy_level": mood.energy_level,
            "notes": mood.notes,
            "created_at": mood.created_at.isoformat()
        } for mood in moods])
