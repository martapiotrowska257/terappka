from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db
from ..models import User, Appointment
from ..auth import jwt_required, get_current_user_from_token

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if 'dateTime' not in data:
        return jsonify({'error': 'Missing dateTime'}), 400

    try:
        dt = datetime.fromisoformat(data['dateTime'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    if current_user.role == User.ROLE_THERAPIST:
        if 'patientId' not in data:
            return jsonify({'error': 'Missing patientId'}), 400
        patient_id = data['patientId']
        therapist_id = current_user.id
    else:
        if 'therapistId' not in data:
            return jsonify({'error': 'Missing therapistId'}), 400
        patient_id = current_user.id
        therapist_id = data['therapistId']

    new_appointment = Appointment(
        patient_id=patient_id,
        therapist_id=therapist_id,
        date_time=dt,
        description=data.get('description', ''),
        status=Appointment.STATUS_SCHEDULED
    )

    db.session.add(new_appointment)
    db.session.commit()
    return jsonify(new_appointment.to_dict()), 201

@appointments_bp.route('/api/appointments', methods=['GET'])
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

@appointments_bp.route('/api/appointments/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_appointment_status(id):
    current_user = get_current_user_from_token()
    appointment = Appointment.query.get_or_404(id)

    if current_user.role != User.ROLE_ADMIN:
        if current_user.id != appointment.patient_id and current_user.id != appointment.therapist_id:
            return jsonify({'error': 'Brak uprawnień'}), 403

    data = request.get_json()
    new_status = data.get('status')
    
    valid_statuses = [
        Appointment.STATUS_SCHEDULED, Appointment.STATUS_CONFIRMED, 
        Appointment.STATUS_COMPLETED, Appointment.STATUS_CANCELLED, Appointment.STATUS_NO_SHOW
    ]

    if new_status not in valid_statuses:
        return jsonify({'error': 'Nieprawidłowy status'}), 400

    if new_status == Appointment.STATUS_CANCELLED:
        reason = data.get('cancellationReason')
        if not reason:
            return jsonify({'error': 'Wymagany powód'}), 400
        appointment.cancellation_reason = reason

    if new_status == Appointment.STATUS_COMPLETED:
        if current_user.role == User.ROLE_PATIENT:
            return jsonify({'error': 'Tylko terapeuta może zakończyć wizytę'}), 403
        notes = data.get('outcomeNotes')
        if notes:
            appointment.outcome_notes = notes

    appointment.status = new_status
    db.session.commit()
    return jsonify(appointment.to_dict())

@appointments_bp.route('/api/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def reschedule_appointment(id):
    current_user = get_current_user_from_token()
    appointment = Appointment.query.get_or_404(id)

    if current_user.id != appointment.patient_id and current_user.id != appointment.therapist_id:
        return jsonify({'error': 'Brak uprawnień'}), 403

    data = request.get_json()
    if 'dateTime' in data:
        try:
            new_date = datetime.fromisoformat(data['dateTime'].replace('Z', '+00:00'))
            appointment.date_time = new_date
            appointment.status = Appointment.STATUS_SCHEDULED
            appointment.cancellation_reason = None 
            db.session.commit()
            return jsonify(appointment.to_dict())
        except ValueError:
            return jsonify({'error': 'Błędny format daty'}), 400

    return jsonify({'error': 'Brak nowej daty'}), 400