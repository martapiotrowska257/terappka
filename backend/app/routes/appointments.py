from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db, socketio
from ..models import User, Appointment
from ..auth import jwt_required, get_current_user_from_token

appointments_bp = Blueprint('appointments', __name__)

def notify_calendar_update(therapist_id, patient_id=None):
    if therapist_id:
        socketio.emit('calendar_updated', room=therapist_id)
    if patient_id:
        socketio.emit('calendar_updated', room=patient_id)

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
        patient_id = data.get('patientId') 
        therapist_id = current_user.id
        status = Appointment.STATUS_SCHEDULED if patient_id else Appointment.STATUS_AVAILABLE

    elif current_user.role == User.ROLE_PATIENT:
        if 'therapistId' not in data:
            return jsonify({'error': 'Missing therapistId'}), 400
        patient_id = current_user.id
        therapist_id = data['therapistId']
        status = Appointment.STATUS_SCHEDULED

    elif current_user.role == User.ROLE_ADMIN:
        if 'therapistId' not in data:
             return jsonify({'error': 'Missing therapistId'}), 400
        patient_id = data.get('patientId')
        therapist_id = data['therapistId']
        status = Appointment.STATUS_SCHEDULED if patient_id else Appointment.STATUS_AVAILABLE

    new_appointment = Appointment(
        patient_id=patient_id,
        therapist_id=therapist_id,
        date_time=dt,
        description=data.get('description', ''),
        status=status,
        duration=data.get('duration', 50)
    )

    db.session.add(new_appointment)
    db.session.commit()

    notify_calendar_update(new_appointment.therapist_id, new_appointment.patient_id)

    return jsonify(new_appointment.to_dict()), 201

@appointments_bp.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.role == User.ROLE_ADMIN:
        appointments = Appointment.query.all()
    else:
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
        Appointment.STATUS_AVAILABLE, Appointment.STATUS_SCHEDULED, 
        Appointment.STATUS_CONFIRMED, Appointment.STATUS_COMPLETED, 
        Appointment.STATUS_CANCELLED, Appointment.STATUS_NO_SHOW
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

    notify_calendar_update(appointment.therapist_id, appointment.patient_id)

    return jsonify(appointment.to_dict())

@appointments_bp.route('/api/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def reschedule_appointment(id):
    current_user = get_current_user_from_token()
    appointment = Appointment.query.get_or_404(id)

    if current_user.role != User.ROLE_ADMIN and current_user.id != appointment.patient_id and current_user.id != appointment.therapist_id:
        return jsonify({'error': 'Brak uprawnień'}), 403

    data = request.get_json()
    if 'dateTime' in data:
        try:
            new_date = datetime.fromisoformat(data['dateTime'].replace('Z', '+00:00'))
            appointment.date_time = new_date

            appointment.status = Appointment.STATUS_SCHEDULED if appointment.patient_id else Appointment.STATUS_AVAILABLE
            appointment.cancellation_reason = None 
            db.session.commit()

            notify_calendar_update(appointment.therapist_id, appointment.patient_id)

            return jsonify(appointment.to_dict())
        except ValueError:
            return jsonify({'error': 'Błędny format daty'}), 400

    return jsonify({'error': 'Brak nowej daty'}), 400

@appointments_bp.route('/api/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(id):
    current_user = get_current_user_from_token()
    appointment = Appointment.query.get_or_404(id)

    if current_user.role != User.ROLE_ADMIN and appointment.therapist_id != current_user.id:
        return jsonify({'error': 'Brak uprawnień do usunięcia tej wizyty'}), 403

    db.session.delete(appointment)
    db.session.commit()

    notify_calendar_update(appointment.therapist_id, appointment.patient_id)

    return '', 204