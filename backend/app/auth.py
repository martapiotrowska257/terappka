# backend/app/auth.py
import jwt
from functools import wraps
from flask import request, jsonify, g
import os

# Adres do pobierania kluczy publicznych z Keycloaka (JWKS).
# Domyślnie w sieci Dockerowej adres to http://keycloak:8080.
# Pamiętaj, aby podmienić "terappka" na właściwą nazwę Twojego Realmu, jeśli jest inna.
KEYCLOAK_CERTS_URL = os.environ.get(
    'KEYCLOAK_CERTS_URL', 
    'http://keycloak:8080/realms/terappka/protocol/openid-connect/certs'
)

# PyJWKClient automatycznie odpyta Keycloaka i scache'uje klucze w pamięci
jwks_client = jwt.PyJWKClient(KEYCLOAK_CERTS_URL)

def jwt_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            
            # 1. Wyciągnięcie tokena z nagłówka
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'error': 'Brak tokena autoryzacyjnego w nagłówku!'}), 401
            
            try:
                # 2. Pobranie klucza publicznego (dopasowanego do tego konkretnego tokena)
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                
                # 3. Dekodowanie i weryfikacja
                # verify_aud=False przydaje się, gdy Keycloak nie ustawia poprawnie odbiorcy (audience)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    options={"verify_aud": False} 
                )
                
                # 4. Przekazanie rozszyfrowanych danych (np. email, id) do obiektu globalnego g Flaska
                g.jwt_payload = payload
                
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token wygasł!'}), 401
            except jwt.InvalidTokenError as e:
                return jsonify({'error': f'Nieprawidłowy token! {str(e)}'}), 401
            except Exception as e:
                return jsonify({'error': f'Błąd weryfikacji Keycloak: {str(e)}'}), 401

            return fn(*args, **kwargs)
        return decorator
    return wrapper