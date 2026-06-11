from . import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    ROLE_ADMIN = 'ADMIN'
    ROLE_PATIENT = 'PATIENT'
    ROLE_THERAPIST = 'THERAPIST'

    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    role = db.Column(db.String(50), default=ROLE_PATIENT)
    appointments_as_patient = db.relationship('Appointment', foreign_keys='Appointment.patient_id', back_populates='patient')
    diaries = db.relationship('Diary', back_populates='patient')
    createdAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'role': self.role,
            'appointmentsAsPatient': self.appointments_as_patient,
            'diaries': self.diaries,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'updatedAt': self.updatedAt.isoformat() if self.updatedAt else None
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'

    STATUS_AVAILABLE = 'AVAILABLE' #wolny termin
    STATUS_SCHEDULED = 'SCHEDULED' #zaplanowna
    STATUS_CONFIRMED = 'CONFIRMED' #potwerdzona przez terapeutę
    STATUS_COMPLETED = 'COMPLETED' #zakończona
    STATUS_CANCELLED = 'CANCELLED' #odwołana przez pacjenta lub terapeutę
    STATUS_NO_SHOW = 'NO_SHOW' #pacjent nie przyszedł i nie odwołał

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    therapist_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    date_time = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text, nullable=True) 

    status = db.Column(db.String(50), default=STATUS_SCHEDULED, nullable=False)
    cancellation_reason = db.Column(db.String(255), nullable=True) 
    outcome_notes = db.Column(db.Text, nullable=True) 
    
    patient = db.relationship('User', foreign_keys=[patient_id], back_populates='appointments_as_patient')
    therapist = db.relationship('User', foreign_keys=[therapist_id])

    createdAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'patientId': self.patient_id,
            'therapistId': self.therapist_id,
            'dateTime': self.date_time.isoformat(),
            'status': self.status,
            'description': self.description,
            'cancellationReason': self.cancellation_reason,
            'outcomeNotes': self.outcome_notes,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'updatedAt': self.updatedAt.isoformat() if self.updatedAt else None
        }
    

class Diary(db.Model):
    __tablename__ = 'diaries'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    question = db.Column(db.String(500), nullable=False)
    content = db.Column(db.Text, nullable=False)

    patient = db.relationship('User', foreign_keys=[patient_id], back_populates='diaries')

    createdAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'patientId': self.patient_id,
            'question': self.question,
            'content': self.content,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'updatedAt': self.updatedAt.isoformat() if self.updatedAt else None
        }
    
class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')

    createdAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'senderId': self.sender_id,
            'receiverId': self.receiver_id,
            'content': self.content,
            'isRead': self.is_read,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None
        }