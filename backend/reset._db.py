# RESETOWANIE BAZY DANYCH 
# DO USUNIECIA PRZY GOTOWYM PROJEKCIE

from app import create_app, db
from app.models import User, Appointment

app = create_app()

with app.app_context():
    print("Usuwanie starych tabel...")
    db.drop_all() 
    print("Tworzenie nowych tabel z polami statusów...")
    db.create_all()
    print("Gotowe.")