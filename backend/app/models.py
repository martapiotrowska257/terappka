from . import db
from datetime import datetime

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

class Appointment(db.Model):
    __tablename__ = 'appointments'

    STATUS_SCHEDULED = 'SCHEDULED'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CANCELLED = 'CANCELLED'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    therapist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default=STATUS_SCHEDULED)
    description = db.Column(db.Text, nullable=True)

    patient = db.relationship('User', foreign_keys=[patient_id])
    therapist = db.relationship('User', foreign_keys=[therapist_id])

    def to_dict(self):
        return {
            'id': self.id,
            'patientId': self.patient_id,
            'patientName': f"{self.patient.first_name} {self.patient.last_name}" if self.patient else "Unknown",
            'therapistId': self.therapist_id,
            'therapistName': f"{self.therapist.first_name} {self.therapist.last_name}" if self.therapist else "Unknown",
            'dateTime': self.date_time.isoformat(),
            'status': self.status,
            'description': self.description
        }