from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = 'auth.login'

    from app.routes import auth, tasks, habits, focus, mood, resources, forums, insights, gamification, integrations
    app.register_blueprint(auth.bp)
    app.register_blueprint(tasks.bp)
    app.register_blueprint(habits.bp)
    app.register_blueprint(focus.bp)
    app.register_blueprint(mood.bp)
    app.register_blueprint(resources.bp)
    app.register_blueprint(forums.bp)
    app.register_blueprint(insights.bp)
    app.register_blueprint(gamification.bp)
    app.register_blueprint(integrations.bp)

    return app
