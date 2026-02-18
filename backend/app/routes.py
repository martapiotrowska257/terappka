from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from functools import wraps
from datetime import datetime
from . import db
from .models import User, Appointment

main_bp = Blueprint('main', __name__)

# --- POMOCNICZE FUNKCJE ---

def get_current_user_from_token():
    claims = get_jwt()

    email = claims.get('email') 
    
    if not email:
        return None
        
    return User.query.filter_by(email=email).first()

# --- DEKORATORY: ADMIN ---

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required() 
        def decorator(*args, **kwargs):

            user = get_current_user_from_token()
            
            if not user or user.role != User.ROLE_ADMIN:
                return jsonify(msg="Brak uprawnień administratora!"), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# --- ENDPOINTY UŻYTKOWNIKÓW (STARE - POZOSTAWIONE) ---

@main_bp.route('/api/users', methods=['GET'])
@admin_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@main_bp.route('/api/users/<int:id>', methods=['GET'])
@admin_required()
def get_user_by_id(id):
    user = User.query.get_or_404(id)    
    return jsonify(user.to_dict())

@main_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

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

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@main_bp.route('/api/users/<int:id>', methods=['PUT'])
@jwt_required() # Zabezpieczamy, choć logika pozwala każdemu edytować (do poprawy w przyszłości na RBAC)!!!!!!!!!!!!!!!
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    # Tutaj w przyszłości warto dodać sprawdzenie:!!!!!!
    # czy current_user.id == id (czy edytuję samego siebie) LUB czy jestem adminem !!!!!
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
        
    db.session.commit()
    return jsonify(user.to_dict())

@main_bp.route('/api/users/<int:id>', methods=['DELETE'])
@admin_required()
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

# --- NOWE ENDPOINTY: WIZYTY ---

@main_bp.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found in database. Please register first.'}), 404

    data = request.get_json()
    
    if 'therapistId' not in data or 'dateTime' not in data:
        return jsonify({'error': 'Missing therapistId or dateTime'}), 400

    try:
        dt = datetime.fromisoformat(data['dateTime'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    new_appointment = Appointment(
        patient_id=current_user.id,
        therapist_id=data['therapistId'],
        date_time=dt,
        description=data.get('description', ''),
        status=Appointment.STATUS_SCHEDULED
    )

    db.session.add(new_appointment)
    db.session.commit()
    
    return jsonify(new_appointment.to_dict()), 201

@main_bp.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    appointments = Appointment.query.filter(
        (Appointment.patient_id == current_user.id) | 
        (Appointment.therapist_id == current_user.id)
    ).all()

    return jsonify([appt.to_dict() for appt in appointments])