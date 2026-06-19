import jwt
from functools import wraps
from flask import request, jsonify, g
import os
from sqlalchemy.exc import IntegrityError
from . import db
from .models import User

KEYCLOAK_CERTS_URL = os.environ.get(
    'KEYCLOAK_CERTS_URL', 
    'http://keycloak:8080/realms/terappka/protocol/openid-connect/certs'
)

jwks_client = jwt.PyJWKClient(KEYCLOAK_CERTS_URL)

def jwt_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'error': 'Brak tokena autoryzacyjnego w nagłówku!'}), 401
            
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    options={"verify_aud": False} 
                )
                g.jwt_payload = payload

                get_current_user_from_token()
                
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token wygasł!'}), 401
            except jwt.InvalidTokenError as e:
                return jsonify({'error': f'Nieprawidłowy token! {str(e)}'}), 401
            except Exception as e:
                return jsonify({'error': f'Błąd weryfikacji Keycloak: {str(e)}'}), 401

            return fn(*args, **kwargs)
        return decorator
    return wrapper

def get_current_user_from_token():
    claims = getattr(g, 'jwt_payload', None)
    if not claims:
        return None
 
    keycloak_id = claims.get('sub') 
    email = claims.get('email')

    user = User.query.get(keycloak_id)

    if not user:
        realm_roles = claims.get('realm_access', {}).get('roles', [])
        
        user_role = User.ROLE_PATIENT
        if 'admin' in realm_roles:
            user_role = User.ROLE_ADMIN
        elif 'therapist' in realm_roles:
            user_role = User.ROLE_THERAPIST

        user = User(
            id=keycloak_id, 
            email=email,
            first_name=claims.get('given_name', ''),
            last_name=claims.get('family_name', ''),
            role=user_role 
        )
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            user = User.query.get(keycloak_id)
            
    return user

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required() 
        def decorator(*args, **kwargs):
            user = get_current_user_from_token()
            if not user or user.role != User.ROLE_ADMIN:
                return jsonify(msg="Brak uprawnień administratora!"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper