from flask import Blueprint, request, jsonify
from sqlalchemy import func
from datetime import datetime
from .. import db
from ..models import User, Diary
from ..auth import jwt_required, get_current_user_from_token

diary_bp = Blueprint('diary', __name__)

DIARY_QUESTIONS = [
    "Jak mija Ci dzisiejszy dzień?",
    "Kto sprawił, że poczułeś/aś się ostatnio zmotywowany/a?",
    "Co dobrego Cię dzisiaj spotkało, nawet jeśli to była drobnostka?",
    "Za co jesteś dzisiaj wdzięczny/a?",
    "Jakie emocje towarzyszyły Ci przez większość dzisiejszego dnia i dlaczego?",
    "Gdybyś mógł/mogła powiedzieć sobie z wczoraj jedną rzecz, co by to było?",
    "Z jakim wyzwaniem udało Ci się ostatnio zmierzyć?",
    "Co zrobiłeś/aś dzisiaj tylko dla siebie?"
]

@diary_bp.route('/api/diary/question', methods=['GET'])
@jwt_required()
def get_daily_question():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    day_of_year = datetime.utcnow().timetuple().tm_yday
    question_index = day_of_year % len(DIARY_QUESTIONS)
    return jsonify({'question': DIARY_QUESTIONS[question_index]})

@diary_bp.route('/api/diary', methods=['POST'])
@jwt_required()
def create_diary_entry():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
        
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Tylko pacjenci mogą prowadzić pamiętnik'}), 403

    data = request.get_json()
    question = data.get('question')
    content = data.get('content')

    if not question or not content:
        return jsonify({'error': 'Brakuje pytania lub treści wpisu'}), 400

    new_entry = Diary(
        patient_id=current_user.id,
        question=question,
        content=content
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify(new_entry.to_dict()), 201

@diary_bp.route('/api/diary', methods=['GET']) # poprawic bo sciaga wszystkie rekordy np. 1000 jak chcemy rekord sprzed 3 lat, najlepiej po dacie albo po id, ale wtedy trzeba by bylo zrobic endpoint do pobierania konkretnego rekordu, a nie wszystkich
@jwt_required()
def get_diary_entries():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
        
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Tylko pacjenci mają dostęp do pamiętnika'}), 403

    # Pobieramy datę z zapytania (np. "2024-05-15")
    target_date = request.args.get('date')

    if target_date:
        # 2. UŻYWAMY func.date() ABY "OBRZEZAĆ" GODZINĘ Z BAZY DO PORÓWNANIA
        # Uwaga: użyj właściwej nazwy kolumny (Diary.created_at lub Diary.date)
        entry = Diary.query.filter(
            Diary.patient_id == current_user.id,
            func.date(Diary.created_at) == target_date  # Tutaj dzieje się magia!
        ).first()
        
        if entry:
            return jsonify(entry.to_dict())
        else:
            # Zwracamy 404, co frontend odczyta i wyczyści pole wpisu
            return jsonify({'message': 'Brak wpisu dla tej daty'}), 404

    # Jeśli frontend nie wysłał daty (target_date jest None), zwracamy całą historię
    entries = Diary.query.filter_by(patient_id=current_user.id)\
                         .order_by(Diary.created_at.desc())\
                         .all()
    
    return jsonify([entry.to_dict() for entry in entries])

@diary_bp.route('/api/diary/<int:id>', methods=['GET'])
@jwt_required()
def get_diary_entry_by_id(id):
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
        
    if current_user.role != User.ROLE_PATIENT:
        return jsonify({'error': 'Tylko pacjenci mają dostęp do pamiętnika'}), 403

    entry = Diary.query.filter_by(id=id, patient_id=current_user.id).first()
    if not entry:
        return jsonify({'error': 'Wpis nie znaleziony'}), 404

    return jsonify(entry.to_dict())