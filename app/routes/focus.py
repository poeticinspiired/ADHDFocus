from flask import Blueprint, render_template, jsonify, request

bp = Blueprint('focus', __name__)

@bp.route('/focus')
def focus():
    return render_template('focus.html')

@bp.route('/api/focus/start', methods=['POST'])
def start_focus_session():
    return jsonify({"message": "Focus session started"})

@bp.route('/api/focus/end', methods=['POST'])
def end_focus_session():
    data = request.json
    duration = data.get('duration', 0)  # Duration in minutes
    return jsonify({
        "message": "Focus session ended",
        "duration": duration
    })
