from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db
from ..models import User, EmotionEntry
from ..auth import jwt_required, get_current_user_from_token

emotions_bp = Blueprint('emotions', __name__)

@emotions_bp.route('/api/emotions', methods=['POST'])
@jwt_required()
def add_emotion():
    current_user = get_current_user_from_token()
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Tylko pacjenci mogą dodawać wpisy o emocjach'}), 403

    data = request.get_json()
    primary = data.get('primaryEmotion')
    secondary = data.get('secondaryEmotion')

    if not primary or not secondary:
        return jsonify({'error': 'Brak wymaganych danych'}), 400

    new_entry = EmotionEntry(
        patient_id=current_user.id,
        primary_emotion=primary,
        secondary_emotion=secondary
    )
    
    db.session.add(new_entry)
    db.session.commit()

    return jsonify(new_entry.to_dict()), 201

@emotions_bp.route('/api/emotions', methods=['GET'])
@jwt_required()
def get_emotions():
    current_user = get_current_user_from_token()
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Brak uprawnień'}), 403

    # Pobieramy wpisy pacjenta, sortujemy od najstarszych do najnowszych (najlepiej dla wykresu)
    entries = EmotionEntry.query.filter_by(patient_id=current_user.id).order_by(EmotionEntry.createdAt.asc()).all()
    
    return jsonify([entry.to_dict() for entry in entries])