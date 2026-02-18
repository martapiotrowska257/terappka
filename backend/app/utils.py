import requests
import json
from jwt.algorithms import RSAAlgorithm

def get_keycloak_public_key(keycloak_url, realm):

    url = f"{keycloak_url}/realms/{realm}/protocol/openid-connect/certs"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        jwks = response.json()
        
        for key_dict in jwks['keys']:
            if key_dict.get('alg') == 'RS256' and key_dict.get('use') == 'sig':
                public_key = RSAAlgorithm.from_jwk(json.dumps(key_dict))
                return public_key
        
        print("Nie znaleziono klucza RS256 w Keycloak.")
        return None
                
    except Exception as e:
        print(f"BŁĄD: Nie udało się pobrać klucza publicznego z Keycloak: {e}")
        print(f"Upewnij się, że Keycloak działa pod adresem: {url}")
        return None