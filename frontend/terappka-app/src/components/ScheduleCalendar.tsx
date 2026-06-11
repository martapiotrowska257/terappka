"use client";

import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale";
import type { View } from "react-big-calendar";
// @ts-expect-error: side-effect import of CSS file without type declarations
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppointmentStatus } from "../types/appointment";

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

export interface AppointmentEvent extends Event {
  id: string;
  patientName?: string;
  therapistName?: string;
  status: AppointmentStatus;
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

  const handleSelectSlot = useCallback(
    (slotInfo: {
      start: Date;
      end: Date;
      action: "select" | "click" | "doubleClick";
    }) => {
      if (onBookSlot && slotInfo.action === "select") {
        onBookSlot(slotInfo.start, slotInfo.end);
      }
    },
    [onBookSlot],
  );

  const handleSelectEvent = useCallback(
    (event: AppointmentEvent) => {
      if (isTherapist) {
        const confirmCancel = window.confirm(
          `Czy chcesz odwołać wizytę: ${event.title}?`,
        );
        if (confirmCancel && onCancelEvent) {
          onCancelEvent(event.id);
        }
      } else {
        alert(
          `Informacje o wizycie:\n\n${event.title}\nStatus: ${
            event.status === "SCHEDULED" ? "Zaplanowana" : event.status
          }`,
        );
      }
    },
    [isTherapist, onCancelEvent],
  );

  const eventStyleGetter = useCallback((event: AppointmentEvent) => {
    let backgroundColor = "#10b981"; // Domyślny szmaragdowy (emerald-500)
    let color = "white";
    let border = "none";

    switch (event.status) {
      case "AVAILABLE":
        backgroundColor = "#ffffff";
        color = "#10b981";
        border = "2px dashed #10b981";
        break;
      case "SCHEDULED":
      case "CONFIRMED":
        backgroundColor = "#3b82f6";
        break;
      case "COMPLETED":
        backgroundColor = "#6b7280";
        break;
      case "CANCELLED":
      case "NO_SHOW":
        backgroundColor = "#ef4444";
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: "6px",
        opacity: 0.9,
        display: "block",
        fontWeight: 500,
        fontSize: "0.875rem",
        padding: "2px 4px",
      },
    };
  }, []);

  return (
    <div className="h-[600px] md:h-[700px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <Calendar
        localizer={localizer}
        events={events}
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
        selectable={isTherapist}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        defaultView="week"
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
      />
    </div>
  );
}
