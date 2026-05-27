"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale"; // Polski język!
import type { View } from "react-big-calendar";
// @ts-expect-error: side-effect import of CSS file without type declarations
import "react-big-calendar/lib/css/react-big-calendar.css"; // Domyślne style

// Konfiguracja polskiego kalendarza (tydzień zaczyna się w poniedziałek)
const locales = {
  pl: pl,
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

export default function ScheduleCalendar({
  events,
  isTherapist,
  onBookSlot,
  onCancelEvent,
}: ScheduleCalendarProps) {
  const [view, setView] = useState<View>("week");

  // Stylowanie poszczególnych "klocków" w kalendarzu na podstawie statusu
  const eventStyleGetter = (event: AppointmentEvent) => {
    let backgroundColor = "#3b82f6"; // domyślny niebieski
    if (event.status === "AVAILABLE") backgroundColor = "#10b981"; // szmaragdowy
    if (event.status === "CANCELLED") backgroundColor = "#ef4444"; // czerwony

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  return (
    <div className="bg-white p-4 rounded-xl w-full">
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-event {
          font-size: 0.85rem;
          padding: 2px 5px;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #10b981;
          color: white;
          border-color: #10b981;
        }
        .rbc-today {
          background-color: #f9fafb;
        }
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
          noEventsInRange: "Brak wizyt w tym okresie.",
        }}
        view={view}
        onView={(newView: View) => setView(newView)}
        // Zaznaczanie pustych slotów działa tu tylko dla terapeuty (tworzenie dostępności)
        selectable={isTherapist}
        onSelectSlot={(slotInfo) => {
          if (onBookSlot && slotInfo.action === "select") {
            onBookSlot(slotInfo.start, slotInfo.end);
          }
        }}
        onSelectEvent={(event: AppointmentEvent) => {
          // ZMIANA: Sprawdzamy czy użytkownik to terapeuta, czy pacjent
          if (isTherapist) {
            // TERAPEUTA: Może anulować wizytę (wyświetla się prompt)
            const confirmCancel = window.confirm(
              `Czy chcesz odwołać wizytę: ${event.title}?`,
            );
            if (confirmCancel && onCancelEvent) {
              onCancelEvent(event.id);
            }
          } else {
            // PACJENT: Wyświetlamy tylko podgląd informacji o wizycie (bez pytania o anulowanie)
            alert(
              `Informacje o wizycie:\n\n${event.title}\nStatus: ${
                event.status === "BOOKED" ? "Zarezerwowana" : event.status
              }`,
            );
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
