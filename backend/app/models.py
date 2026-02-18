from . import db

class User(db.Model):
    __tablename__ = 'users'

    ROLE_ADMIN = 'ADMIN'
    ROLE_PATIENT = 'PATIENT'
    ROLE_THERAPIST = 'THERAPIST'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    
    role = db.Column(db.String(50), default=ROLE_PATIENT)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role
        }