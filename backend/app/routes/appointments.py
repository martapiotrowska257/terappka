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

    # LOGIKA RÓL I TWORZENIA WIZYTY/SLOTÓW
    if current_user.role == User.ROLE_THERAPIST:
        # Terapeuta może podać patientId (umawia konkretnego pacjenta) 
        # lub nie podać (tworzy okienko dostępności)
        patient_id = data.get('patientId') 
        therapist_id = current_user.id
        status = Appointment.STATUS_SCHEDULED if patient_id else Appointment.STATUS_AVAILABLE

    elif current_user.role == User.ROLE_PATIENT:
        # Pacjent musi podać, do kogo się umawia
        if 'therapistId' not in data:
            return jsonify({'error': 'Missing therapistId'}), 400
        patient_id = current_user.id
        therapist_id = data['therapistId']
        status = Appointment.STATUS_SCHEDULED

    elif current_user.role == User.ROLE_ADMIN:
        # Admin może stworzyć wizytę ręcznie z poziomu panelu dla dowolnych użytkowników
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
        status=status, # Używamy dynamicznie ustalonego statusu
        duration=data.get('duration', 50)
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

    # Admin widzi wszystkie wizyty w systemie, pozostali tylko własne
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

    # Autoryzacja
    if current_user.role != User.ROLE_ADMIN:
        if current_user.id != appointment.patient_id and current_user.id != appointment.therapist_id:
            return jsonify({'error': 'Brak uprawnień'}), 403

    data = request.get_json()
    new_status = data.get('status')
    
    # Dodano STATUS_AVAILABLE do dozwolonych na wypadek anulowania i ponownego zwolnienia slotu
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
        # Opcjonalnie: Jeśli pacjent odwołuje, możesz chcieć usunąć patient_id
        # i przywrócić status na AVAILABLE, by ktoś inny mógł go zająć.
        # Wymagałoby to dopisania np.: appointment.patient_id = None

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

    # Poprawiony warunek - Admin też ma prawo edytować wizytę!
    if current_user.role != User.ROLE_ADMIN and current_user.id != appointment.patient_id and current_user.id != appointment.therapist_id:
        return jsonify({'error': 'Brak uprawnień'}), 403

    data = request.get_json()
    if 'dateTime' in data:
        try:
            new_date = datetime.fromisoformat(data['dateTime'].replace('Z', '+00:00'))
            appointment.date_time = new_date
            
            # Resetujemy wizytę do początkowego statusu w zależności od tego czy ma przypisanego pacjenta
            appointment.status = Appointment.STATUS_SCHEDULED if appointment.patient_id else Appointment.STATUS_AVAILABLE
            appointment.cancellation_reason = None 
            db.session.commit()
            return jsonify(appointment.to_dict())
        except ValueError:
            return jsonify({'error': 'Błędny format daty'}), 400

    return jsonify({'error': 'Brak nowej daty'}), 400

@appointments_bp.route('/api/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(id):
    current_user = get_current_user_from_token()
    appointment = Appointment.query.get_or_404(id)

    # Upewniamy się, że to terapeuta usuwa swój własny termin (lub robi to admin)
    if current_user.role != User.ROLE_ADMIN and appointment.therapist_id != current_user.id:
        return jsonify({'error': 'Brak uprawnień do usunięcia tej wizyty'}), 403

    db.session.delete(appointment)
    db.session.commit()
    return '', 204