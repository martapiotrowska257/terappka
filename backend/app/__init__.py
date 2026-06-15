from flask import Flask, app
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from .config import Config

db = SQLAlchemy()

socketio = SocketIO(cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000"], manage_session=False)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})
    db.init_app(app)
    
    socketio.init_app(app)

    from .routes.users import users_bp
    from .routes.appointments import appointments_bp
    from .routes.diary import diary_bp
    from .routes.messages import messages_bp
    from .routes.emotions import emotions_bp

    app.register_blueprint(users_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(diary_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(emotions_bp)

    from . import sockets
    
    return app