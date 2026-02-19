"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale"; // Polski język!
import "react-big-calendar/lib/css/react-big-calendar.css"; // Domyślne style

// Konfiguracja polskiego kalendarza (tydzień zaczyna się w poniedziałek)
const locales = {
    "pl": pl,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

// Rozszerzamy domyślny typ Event, aby trzymać dodatkowe dane o wizycie
export interface AppointmentEvent extends Event {
    id: string;
    patientName?: string;
    therapistName?: string;
    status: "AVAILABLE" | "BOOKED" | "COMPLETED" | "CANCELLED";
}

interface ScheduleCalendarProps {
    events: AppointmentEvent[];
    isTherapist: boolean;
    onBookSlot?: (start: Date, end: Date) => void;
    onCancelEvent?: (eventId: string) => void;
}

export default function ScheduleCalendar({ events, isTherapist, onBookSlot, onCancelEvent }: ScheduleCalendarProps) {
    const [view, setView] = useState<"month" | "week" | "day">("week");

    // Stylowanie poszczególnych "klocków" w kalendarzu na podstawie statusu
    const eventStyleGetter = (event: AppointmentEvent) => {
        let backgroundColor = "#3b82f6"; // Niebieski (domyślny - np. zaplanowana wizyta pacjenta)
        
        if (event.status === "AVAILABLE") {
            backgroundColor = "#10b981"; // Zielony (szmaragdowy) - wolny termin do wzięcia
        } else if (event.status === "BOOKED" && isTherapist) {
            backgroundColor = "#f59e0b"; // Pomarańczowy - umówiony pacjent
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "8px",
                opacity: 0.9,
                color: "white",
                border: "none",
                display: "block",
                padding: "2px 5px",
                fontSize: "12px",
                fontWeight: "500"
            }
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Własne nadpisanie domyślnych styli react-big-calendar pod Tailwind (opcjonalne, ale ładne) */}
            <style jsx global>{`
                .rbc-btn-group button { color: #374151; border-color: #e5e7eb; }
                .rbc-btn-group button.rbc-active { background-color: #ecfdf5; color: #047857; border-color: #10b981; }
                .rbc-today { background-color: #f9fafb; }
            `}</style>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                culture="pl"
                messages={{
                    next: "Następny",
                    previous: "Poprzedni",
                    today: "Dzisiaj",
                    month: "Miesiąc",
                    week: "Tydzień",
                    day: "Dzień",
                    agenda: "Agenda",
                    noEventsInRange: "Brak wizyt w tym okresie."
                }}
                view={view}
                onView={(newView: any) => setView(newView)}
                selectable={isTherapist} // Zaznaczanie pustych slotów działa tu dla terapeuty (tworzenie dostępności)
                onSelectSlot={(slotInfo) => {
                    // Kliknięcie w puste miejsce
                    if (onBookSlot && slotInfo.action === "select") {
                        onBookSlot(slotInfo.start, slotInfo.end);
                    }
                }}
                onSelectEvent={(event: AppointmentEvent) => {
                    // Kliknięcie w istniejące wydarzenie
                    const confirmCancel = window.confirm(`Czy chcesz odwołać wizytę: ${event.title}?`);
                    if (confirmCancel && onCancelEvent) {
                        onCancelEvent(event.id);
                    }
                }}
                eventPropGetter={eventStyleGetter}
                defaultView="week"
                min={new Date(0, 0, 0, 8, 0, 0)} // Kalendarz zaczyna się od 8:00
                max={new Date(0, 0, 0, 20, 0, 0)} // Kalendarz kończy się o 20:00
            />
        </div>
    );
}