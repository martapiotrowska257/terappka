from flask import Blueprint, request, jsonify
import uuid
from .. import db
from ..models import User
from ..auth import jwt_required, admin_required, get_current_user_from_token

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_current_user_from_token()
    if current_user.role not in [User.ROLE_ADMIN, User.ROLE_THERAPIST]:
        return jsonify({'error': 'Brak uprawnień'}), 403
    
    assigned_only = request.args.get('assigned_only') == 'true'

    if current_user.role == User.ROLE_THERAPIST and assigned_only:
        users = User.query.filter_by(role=User.ROLE_PATIENT, therapist_id=current_user.id).all()
    else:
        users = User.query.filter_by(role=User.ROLE_PATIENT).all()

    return jsonify([u.to_dict() for u in users])

@users_bp.route('/api/users/<string:id>', methods=['GET'])
@admin_required()
def get_user_by_id(id):
    user = User.query.get_or_404(id)    
    return jsonify(user.to_dict())

@users_bp.route('/api/users/therapist', methods=['GET'])
@jwt_required()
def get_my_therapist():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
        
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Tylko pacjent posiada przypisanego opiekuna'}), 400
        
    # Jeśli pacjent nie ma jeszcze przypisanego terapeuty, zwracamy bezpieczny obiekt bez wywoływania błędów Axios
    if not current_user.therapist_id:
        return jsonify({'id': None}), 200
        
    therapist = User.query.get(current_user.therapist_id)
    if not therapist:
        return jsonify({'id': None}), 200
        
    return jsonify(therapist.to_dict())

@users_bp.route('/api/users/<string:patient_id>/assign', methods=['POST'])
@jwt_required()
def assign_patient(patient_id):
    current_user = get_current_user_from_token()
    if current_user.role != User.ROLE_THERAPIST:
        return jsonify({'error': 'Tylko terapeuta może przypisywać pacjentów'}), 403
    
    patient = User.query.get_or_404(patient_id)

    if patient.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Możesz przypisać tylko pacjenta'}), 400
    
    if patient.therapist_id:
        if patient.therapist_id == current_user.id:
            return jsonify({'message': 'Ten pacjent jest już do Ciebie przypisany'}), 200
        return jsonify({'error': 'Pacjent ma już innego terapeutę'}), 409
    
    patient.therapist_id = current_user.id
    db.session.commit()

    return jsonify({'message': 'Pacjent został przypisany pomyślnie!', 'patient': patient.to_dict()}), 200

@users_bp.route('/api/users/<string:id>', methods=['PUT']) # aktualizacja użytkownika - tylko admin
@admin_required()
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()

    if 'email' in data:
        if User.query.filter(User.email == data['email'], User.id != id).first():
            return jsonify({'error': 'Email already in use'}), 409
        user.email = data['email']
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'role' in data:
        requested_role = data['role']
        valid_roles = [User.ROLE_ADMIN, User.ROLE_THERAPIST, User.ROLE_PATIENT]
        if requested_role not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400
        user.role = requested_role

    try:
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@users_bp.route('/api/users/<string:id>', methods=['DELETE'])  # usuwanie użytkownika - tylko admin
@admin_required()
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204