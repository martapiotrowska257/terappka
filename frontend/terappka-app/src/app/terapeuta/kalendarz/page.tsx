"use client";

import { useState } from "react";
import ScheduleCalendar, { AppointmentEvent } from "@/src/components/ScheduleCalendar";

export default function TherapistCalendarPage() {
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

    // Funkcja dodawania nowego okienka dostępności przez terapeutę
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Twój Grafiki i Wizyty</h1>
                        <p className="text-gray-500 text-sm">Zaznacz puste pole w kalendarzu, aby dodać swoje godziny pracy.</p>
                    </div>
                </header>

                <ScheduleCalendar 
                    events={events} 
                    isTherapist={true} 
                    onBookSlot={handleAddAvailability}
                    onCancelEvent={handleCancelEvent}
                />
            </div>
        </div>
    );
}