"use client";

import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale";
// @ts-expect-error: side-effect import of CSS file without type declarations
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { AppointmentStatus } from "@/src/types/appointment";

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
  title: string;
  start: Date;
  end: Date;
  patientName?: string;
  therapistName?: string;
  status: AppointmentStatus;
}

interface ScheduleCalendarProps {
  events: AppointmentEvent[];
  isTherapist: boolean;
  onSlotSelect?: (start: Date) => void;
  onEventClick?: (event: AppointmentEvent) => void;
}

export default function ScheduleCalendar({
  events,
  isTherapist,
  onSlotSelect,
  onEventClick,
}: ScheduleCalendarProps) {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState<Date>(new Date());

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; action: "select" | "click" | "doubleClick" }) => {
      if (onSlotSelect && isTherapist) {
        onSlotSelect(slotInfo.start);
      }
    },
    [onSlotSelect, isTherapist],
  );

  const handleSelectEvent = useCallback(
    (event: AppointmentEvent) => {
      if (onEventClick) {
        onEventClick(event);
      }
    },
    [onEventClick],
  );

  const eventStyleGetter = useCallback((event: AppointmentEvent) => {
    let backgroundColor = "#10b981";
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
        date={date}
        onNavigate={(newDate: Date) => setDate(newDate)}
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
