from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    from app.routes import tasks, habits, focus, mood, resources, insights, gamification, dashboard
    app.register_blueprint(tasks.bp)
    app.register_blueprint(habits.bp)
    app.register_blueprint(focus.bp)
    app.register_blueprint(mood.bp)
    app.register_blueprint(resources.bp)
    app.register_blueprint(insights.bp)
    app.register_blueprint(gamification.bp)
    app.register_blueprint(dashboard.bp)

    return app
