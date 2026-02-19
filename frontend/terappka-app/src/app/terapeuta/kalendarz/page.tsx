// src/app/terapeuta/kalendarz/page.tsx
"use client";

import { useState } from "react";
import ScheduleCalendar, { AppointmentEvent } from "@/src/components/ScheduleCalendar";
// 1. Importujemy nasz nowy modal
import AddAppointmentModal from "@/src/components/AddAppointmentModal";

export default function TherapistCalendarPage() {
    // Stan do kontrolowania widoczności okienka (modala)
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Na początku to będą atrapy danych (MOCKi), docelowo pobierzesz je z bazy (np. useEffect / React Query)
    const [events, setEvents] = useState<AppointmentEvent[]>([
        {
            id: "1",
            title: "Wizyta: Jan Nowak",
            start: new Date(new Date().setHours(10, 0, 0, 0)),
            end: new Date(new Date().setHours(11, 0, 0, 0)),
            status: "BOOKED",
            patientName: "Jan Nowak"
        },
        {
            id: "2",
            title: "Wolny termin",
            start: new Date(new Date().setHours(13, 0, 0, 0)),
            end: new Date(new Date().setHours(14, 0, 0, 0)),
            status: "AVAILABLE",
        }
    ]);

    // Funkcja dodawania nowego okienka dostępności przez kliknięcie na kalendarz
    const handleAddAvailability = (start: Date, end: Date) => {
        const newEvent: AppointmentEvent = {
            id: Math.random().toString(), // Tymczasowe ID
            title: "Wolny termin",
            start,
            end,
            status: "AVAILABLE"
        };
        setEvents([...events, newEvent]);
        // TODO: Tutaj będzie strzał do backendu np. POST /api/appointments
    };

    // Funkcja odwoływania wizyty / usuwania okienka
    const handleCancelEvent = (eventId: string) => {
        setEvents(events.filter(e => e.id !== eventId));
        // TODO: Tutaj będzie strzał do backendu np. DELETE /api/appointments/{id}
    };

    // Funkcja odświeżająca listę po dodaniu wizyty przez formularz
    const fetchAppointments = () => {
        // TODO: W przyszłości tutaj zrobisz ponowne pobranie wizyt z API (GET /api/appointments)
        // aby kalendarz zaktualizował się o nowo dodaną z poziomu modala wizytę
        console.log("Odświeżam kalendarz, bo dodano nową wizytę...");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Twój Grafiki i Wizyty</h1>
                        <p className="text-gray-500 text-sm">
                            Zaznacz puste pole w kalendarzu, aby dodać godziny pracy lub przypisz pacjenta ręcznie.
                        </p>
                    </div>
                    {/* 2. Przycisk otwierający okienko formularza */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-md transition-colors flex items-center gap-2"
                    >
                        <span>+ Zaplanuj wizytę</span>
                    </button>
                </header>

                <ScheduleCalendar 
                    events={events} 
                    isTherapist={true} 
                    onBookSlot={handleAddAvailability}
                    onCancelEvent={handleCancelEvent}
                />

                {/* 3. Wyświetlanie modala warunkowo (tylko gdy isModalOpen === true) */}
                {isModalOpen && (
                    <AddAppointmentModal 
                        onClose={() => setIsModalOpen(false)} 
                        onAdded={fetchAppointments} 
                    />
                )}
            </div>
        </div>
    );
}