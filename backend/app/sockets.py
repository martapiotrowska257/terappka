# backend/app/sockets.py
from flask_socketio import emit, join_room
from . import socketio, db
from .models import Message, User
from .auth import jwks_client # Importujemy Twojego klienta Keycloak do sprawdzania tokenów
import jwt

# Funkcja pomocnicza do sprawdzania tokena przez WebSockety
def verify_socket_token(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload.get('sub') # Zwracamy Keycloak ID
    except Exception as e:
        return None

# EVENT 1: Użytkownik otwiera czat i się autoryzuje
@socketio.on('authenticate')
def on_authenticate(data):
    token = data.get('token')
    user_id = verify_socket_token(token)
    
    if user_id:
        join_room(user_id) # Użytkownik "wchodzi" do pokoju z własnym ID
        emit('authenticated', {'status': 'success', 'userId': user_id})
    else:
        emit('authenticated', {'status': 'error', 'msg': 'Nieprawidłowy token'})

# EVENT 2: Ktoś wysyła wiadomość
@socketio.on('send_message')
def handle_send_message(data):
    token = data.get('token')
    sender_id = verify_socket_token(token)
    
    if not sender_id:
        emit('error', {'msg': 'Nieautoryzowany'})
        return

    receiver_id = data.get('receiverId')
    content = data.get('content')

    if not receiver_id or not content:
        return

    # 1. Najpierw zapisujemy wiadomość w bazie danych (tak jak robiliśmy to w API)
    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )
    db.session.add(new_message)
    db.session.commit()

    msg_dict = new_message.to_dict()

    # 2. Magia WebSocketów: Wysyłamy wiadomość NA ŻYWO do pokoju odbiorcy!
    emit('receive_message', msg_dict, room=receiver_id)
    
    # 3. Odsyłamy też kopię do nadawcy (żeby potwierdzić wysłanie i dodać do jego okna czatu)
    emit('message_sent', msg_dict, room=sender_id)