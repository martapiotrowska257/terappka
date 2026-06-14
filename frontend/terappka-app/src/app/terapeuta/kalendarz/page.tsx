"use client";

import { useState, useEffect, useCallback } from "react";
import ScheduleCalendar, {
  AppointmentEvent,
} from "@/src/components/calendar/ScheduleCalendar";
import AppointmentControlPanel from "@/src/components/calendar/therapist/AppointmentControlPanel";
import api from "@/src/lib/api";
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";
import type { User } from "@/src/types/user";
import { useSession } from "next-auth/react";
import { socket } from "@/src/lib/utils";

export default function TherapistCalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null,
  );
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    }
    try {
      const resPatients = await api.get("/api/users?assigned_only=true");
      setPatients(resPatients.data);

      const resAppointments = await api.get("/api/appointments");
      const mappedEvents: AppointmentEvent[] = resAppointments.data.map(
        (app: Appointment) => {
          const dateString = app.dateTime.endsWith("Z")
            ? app.dateTime
            : `${app.dateTime}Z`;
          const startDate = new Date(dateString);
          const endDate = new Date(
            startDate.getTime() + (app.duration || 50) * 60 * 1000,
          );

          const patientInfo = resPatients.data.find(
            (p: User) => p.id === app.patientId,
          );
          const pName = patientInfo
            ? `${patientInfo.firstName} ${patientInfo.lastName}`
            : "Nieznany pacjent";

          return {
            id: String(app.id),
            title:
              app.status === "AVAILABLE" ? "Wolny termin" : `Sesja: ${pName}`,
            start: startDate,
            end: endDate,
            status: app.status as AppointmentStatus,
            patientName: pName,
            description: app.description,
            cancellationReason: app.cancellationReason,
          };
        },
      );
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (!session?.accessToken) return;

    socket.on("connect", () => {
      socket.emit("authenticate", { token: session.accessToken });
    });

    socket.on("calendar_updated", () => {
      console.log(
        "🔄 Otrzymano sygnał z backendu! Odświeżam kalendarz w tle...",
      );
      fetchData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [session, fetchData]);

  const handleSlotSelect = (start: Date) => {
    setSelectedEvent(null);
    setSelectedSlotDate(start);
  };

  const handleEventClick = (event: AppointmentEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="  p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Zarządzanie Grafikiem
        </h1>
        <p className="text-gray-500 text-sm">
          Zaznacz godzinę na kalendarzu i dodaj spotkanie w panelu po prawej
          stronie.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center text-emerald-600">
              Ładowanie kalendarza...
            </div>
          ) : (
            <ScheduleCalendar
              events={events}
              isTherapist={true}
              onSlotSelect={handleSlotSelect}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <AppointmentControlPanel
            selectedEvent={selectedEvent}
            selectedSlotDate={selectedSlotDate}
            events={events}
            patients={patients}
            onCloseEvent={() => setSelectedEvent(null)}
            onRefresh={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
