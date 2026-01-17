from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from enum import Enum

app = Flask(__name__)

# --- KONFIGURACJA ---
# Umożliwiamy frontendowi (Next.js) łączenie się z tym backendem
CORS(app)

# Dane do bazy przepisane z Twojego application.properties
# user: terappka, pass: admin1, db: terappka_db, port: 3306
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://terappka:admin1@localhost:3306/terappka_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODEL DANYCH (odpowiednik User.java) ---

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50))

    # Metoda zamieniająca obiekt bazy na JSON (zamiast UserDto)
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'firstName': self.first_name, # Zachowujemy camelCase dla frontendu
            'lastName': self.last_name
        }

# --- ENDPOINTY (odpowiednik UserController.java) ---

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Walidacja - email jest wymagany
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

    # Sprawdzenie czy taki email już jest
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'User already exists'}), 409

    # Tworzenie usera - logika z UserService.java (hasło tmp123)
    new_user = User(
        email=data['email'],
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        password="tmp123", 
        role="USER"
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
        
    db.session.commit()
    return jsonify(user.to_dict())

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

# --- START APLIKACJI ---
if __name__ == '__main__':
    # Upewnij się, że tabele istnieją
    with app.app_context():
        db.create_all()
    
    # Uruchom na porcie 8080 (tak jak Spring Boot)
    app.run(debug=True, port=8080)

    #test