from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from flask_login import login_required, current_user
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from todoist_api_python.api import TodoistAPI
from app import db
from app.models import User
import os
import json

bp = Blueprint('integrations', __name__)

# Google Calendar integration
GOOGLE_CLIENT_CONFIG = {
    "web": {
        "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
        "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}

GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

@bp.route('/integrations')
@login_required
def integrations():
    return render_template('integrations.html')

@bp.route('/authorize/google')
@login_required
def authorize_google():
    flow = Flow.from_client_config(GOOGLE_CLIENT_CONFIG, scopes=GOOGLE_SCOPES)
    flow.redirect_uri = url_for('integrations.oauth2callback', _external=True)
    authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
    session['state'] = state
    return redirect(authorization_url)

@bp.route('/oauth2callback')
@login_required
def oauth2callback():
    state = session['state']
    flow = Flow.from_client_config(GOOGLE_CLIENT_CONFIG, scopes=GOOGLE_SCOPES, state=state)
    flow.redirect_uri = url_for('integrations.oauth2callback', _external=True)
    
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)
    credentials = flow.credentials
    
    current_user.google_credentials = json.dumps({
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    })
    db.session.commit()
    
    return redirect(url_for('integrations.integrations'))

@bp.route('/sync/google-calendar')
@login_required
def sync_google_calendar():
    if not current_user.google_credentials:
        return jsonify({'error': 'Google Calendar not connected'}), 400
    
    credentials = Credentials.from_authorized_user_info(json.loads(current_user.google_credentials))
    service = build('calendar', 'v3', credentials=credentials)
    
    events_result = service.events().list(calendarId='primary', timeMin='2024-09-17T00:00:00Z',
                                          maxResults=10, singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])
    
    # Here you would typically sync these events with your app's task system
    # For now, we'll just return the events as JSON
    return jsonify(events)

# Todoist integration
@bp.route('/authorize/todoist')
@login_required
def authorize_todoist():
    todoist_client_id = os.environ.get("TODOIST_CLIENT_ID")
    redirect_uri = url_for('integrations.todoist_callback', _external=True)
    return redirect(f"https://todoist.com/oauth/authorize?client_id={todoist_client_id}&scope=data:read_write&state=random_state_string&redirect_uri={redirect_uri}")

@bp.route('/todoist-callback')
@login_required
def todoist_callback():
    code = request.args.get('code')
    todoist_client_id = os.environ.get("TODOIST_CLIENT_ID")
    todoist_client_secret = os.environ.get("TODOIST_CLIENT_SECRET")
    redirect_uri = url_for('integrations.todoist_callback', _external=True)
    
    # Exchange the code for an access token
    # In a real application, you would make an HTTP request to Todoist's token endpoint
    # For this example, we'll assume we got the token
    todoist_token = "example_todoist_token"
    
    current_user.todoist_token = todoist_token
    db.session.commit()
    
    return redirect(url_for('integrations.integrations'))

@bp.route('/sync/todoist')
@login_required
def sync_todoist():
    if not current_user.todoist_token:
        return jsonify({'error': 'Todoist not connected'}), 400
    
    api = TodoistAPI(current_user.todoist_token)
    try:
        tasks = api.get_tasks()
        # Here you would typically sync these tasks with your app's task system
        # For now, we'll just return the tasks as JSON
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
