from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    db.init_app(app)
    
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app