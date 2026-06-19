import os
from dotenv import load_dotenv
from .utils import get_keycloak_public_key

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- KONFIGURACJA JWT (KEYCLOAK) ---
    
    KEYCLOAK_INTERNAL_URL = os.environ.get('KEYCLOAK_INTERNAL_URL', 'http://keycloak:8080')
    KEYCLOAK_REALM = os.environ.get('KEYCLOAK_REALM', 'terappka')

    JWT_PUBLIC_KEY = get_keycloak_public_key(KEYCLOAK_INTERNAL_URL, KEYCLOAK_REALM)

    JWT_ALGORITHM = "RS256"

    JWT_DECODE_ALGORITHMS = ["RS256"]

    JWT_IDENTITY_CLAIM = "sub"