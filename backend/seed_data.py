from app import create_app, db
from app.models import User, Appointment
from datetime import datetime, timedelta
import random

# Funkcja do seedowania bazy danych testowymi danymi

app = create_app()

def seed():
    with app.app_context():
        print("🧹 Czyszczenie bazy danych...")
        try:
            db.session.query(Appointment).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("✅ Baza wyczyszczona.")
        except Exception as e:
            print(f"⚠️ Uwaga przy czyszczeniu (może to pierwszy start?): {e}")
            db.session.rollback()

        print("🌱 Tworzenie użytkowników...")
        
        # 1. Administrator
        admin = User(
            email="admin@terappka.pl",
            role="ADMIN",
            first_name="Super",
            last_name="Admin"
        )

        # 2. Terapeuci
        therapist1 = User(
            email="house@terappka.pl",
            role="THERAPIST",
            first_name="Gregory",
            last_name="House"
        )
        
        therapist2 = User(
            email="freud@terappka.pl",
            role="THERAPIST",
            first_name="Zygmunt",
            last_name="Freud"
        )

        therapist3 = User(
            email="sobol@terappka.pl",
            role="THERAPIST",
            first_name="Anna",
            last_name="Sobolewska"
        )

        # 3. Pacjenci
        patient1 = User(
            email="jan@pacjent.pl",
            role="PATIENT",
            first_name="Jan",
            last_name="Kowalski"
        )

        patient2 = User(
            email="maria@pacjent.pl",
            role="PATIENT",
            first_name="Maria",
            last_name="Nowak"
        )

        users = [admin, therapist1, therapist2, therapist3, patient1, patient2]
        db.session.add_all(users)
        db.session.commit()
        print(f"✅ Dodano {len(users)} użytkowników.")

        print("📅 Tworzenie wizyt...")
        
        # Daty pomocnicze
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        tomorrow = now + timedelta(days=1)
        next_week = now + timedelta(days=7)

        appointments = [
            # Wizyta zaplanowana (Jutro) - Jan u Dr House
            Appointment(
                patient_id=patient1.id,
                therapist_id=therapist1.id,
                date_time=tomorrow.replace(hour=10, minute=0, second=0),
                description="Konsultacja wstępna - bóle psychosomatyczne",
                status="SCHEDULED"
            ),
            # Wizyta zaplanowana (Za tydzień) - Maria u Dr Freud
            Appointment(
                patient_id=patient2.id,
                therapist_id=therapist2.id,
                date_time=next_week.replace(hour=14, minute=30, second=0),
                description="Terapia snów",
                status="SCHEDULED"
            ),
            # Wizyta Zakończona (Wczoraj) - Jan u Dr Sobolewskiej
            Appointment(
                patient_id=patient1.id,
                therapist_id=therapist3.id,
                date_time=yesterday.replace(hour=9, minute=0, second=0),
                description="Kontrola postępów",
                status="COMPLETED",
                outcome_notes="Pacjent wykazuje znaczną poprawę nastroju. Zalecono kontynuację."
            ),
            # Wizyta Odwołana - Maria u Dr House
            Appointment(
                patient_id=patient2.id,
                therapist_id=therapist1.id,
                date_time=tomorrow.replace(hour=12, minute=0, second=0),
                description="Nagły ból",
                status="CANCELLED",
                cancellation_reason="Lekarz wezwany na dyżur w szpitalu"
            )
        ]

        db.session.add_all(appointments)
        db.session.commit()
        print(f"✅ Dodano {len(appointments)} wizyt testowych.")
        print("\n🚀 GOTOWE! Możesz odpalać Frontend.")

if __name__ == "__main__":
    seed()