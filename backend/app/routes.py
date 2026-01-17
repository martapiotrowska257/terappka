from flask import Blueprint, request, jsonify
from . import db
from .models import User

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@main_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'User already exists'}), 409

    new_user = User(
        email=data['email'],
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        password="tmp123", 
        role="USER"
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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

@main_bp.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204