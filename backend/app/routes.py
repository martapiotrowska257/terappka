from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from functools import wraps
from . import db
from .models import User

main_bp = Blueprint('main', __name__)

# DLA MARTY - od teraz tylko admin bedzie mogl usuwac uzytkownikow oraz sprawdzac liste
# dodałem tez mozliwosc definiowania ról uzytkownikow w Rejestracja (tymaczasowo)
# --- POMONICZE ENDPOINTY: ADMIN ---

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request() 
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user or user.role != User.ROLE_ADMIN:
                return jsonify(msg="Brak uprawnień administratora!"), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper  

# --- ENDPOINT: LOGOWANIE ---
@main_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user=user.to_dict()), 200
    
    return jsonify({"error": "Błędny email lub hasło"}), 401

# --- ENDPOINT: POBIERANIE WSZYSTKICH UŻYTKOWNIKÓW ---
@main_bp.route('/api/users', methods=['GET'])
@admin_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# --- ENDPOINT: POBIERANIE UŻYTKOWNIKA PO ID ---
@main_bp.route('/api/users/<int:id>', methods=['GET'])
@admin_required()
def get_user_by_id(id):
    user = User.query.get_or_404(id)    
    return jsonify(user.to_dict())

# --- ENDPOINT: REJESTRACJA UŻYTKOWNIKA ---
@main_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'User already exists'}), 409

    requested_role = data.get('role', User.ROLE_PATIENT)

    valid_roles = [User.ROLE_ADMIN, User.ROLE_THERAPIST, User.ROLE_PATIENT]
    
    if requested_role not in valid_roles:
         return jsonify({'error': 'Invalid role'}), 400

    new_user = User(
        email=data['email'],
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        role=requested_role 
    )

    new_user.set_password(data['password'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# --- ENDPOINT: AKTUALIZACJA DANYCH ---
@main_bp.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
        
    db.session.commit()
    return jsonify(user.to_dict())

# --- ENDPOINT: USUWANIE (ZABEZPIECZONE TOKENEM) ---
@main_bp.route('/api/users/<int:id>', methods=['DELETE'])
@admin_required()
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204