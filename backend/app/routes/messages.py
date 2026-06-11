from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_
from .. import db
from ..models import User, Message
from ..auth import jwt_required, get_current_user_from_token

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/api/messages/<string:other_user_id>', methods=['GET'])
@jwt_required()
def get_conversation(other_user_id):
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    # Szukamy wiadomości, w których:
    # (Ja jestem nadawcą I on jest odbiorcą) LUB (On jest nadawcą I ja jestem odbiorcą)
    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.createdAt.asc()).all()

    return jsonify([m.to_dict() for m in messages])


@messages_bp.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    receiver_id = data.get('receiverId')
    content = data.get('content')

    if not receiver_id or not content:
        return jsonify({'error': 'Brak odbiorcy lub treści wiadomości'}), 400

    # Sprawdzenie czy odbiorca istnieje
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'error': 'Odbiorca nie istnieje'}), 404

    new_message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.to_dict()), 201