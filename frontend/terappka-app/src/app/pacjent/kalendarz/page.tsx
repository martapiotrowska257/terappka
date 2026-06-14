"use client";

import { useState, useEffect, useCallback } from "react";
import ScheduleCalendar, {
  AppointmentEvent,
} from "@/src/components/calendar/ScheduleCalendar";
import api from "@/src/lib/api";
import Toast from "@/src/components/utils/Toast";
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";
import { useSession } from "next-auth/react";
import PatientAppointmentModal from "@/src/components/calendar/patient/PatientAppointmentModal";
import { socket } from "@/src/lib/utils";

export default function PatientCalendarPage() {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null,
  );

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await api.get("/api/appointments");

      const mappedEvents: AppointmentEvent[] = res.data.map(
        (app: Appointment) => {
          const dateString = app.dateTime.endsWith("Z")
            ? app.dateTime
            : `${app.dateTime}Z`;
          const startDate = new Date(dateString);
          const endDate = new Date(
            startDate.getTime() + (app.duration || 50) * 60 * 1000,
          );

          return {
            id: String(app.id),
            title: app.therapistName
              ? `Sesja: ${app.therapistName}`
              : "Sesja terapeutyczna",
            start: startDate,
            end: endDate,
            status: app.status as AppointmentStatus,
            therapistId: app.therapistId,
            therapistName: app.therapistName,
            description: app.description,
            cancellationReason: app.cancellationReason,
          };
        },
      );

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Błąd pobierania wizyt:", error);
    } finally {
      if (!isSilent) setIsLoading(false);
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
      fetchData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [session, fetchData]);

  const handleCancelAppointment = async (reason: string) => {
    if (!selectedEvent) return;

    setIsActionLoading(true);
    try {
      const finalReason = reason.trim() || "Odwołana przez pacjenta";
      await api.patch(`/api/appointments/${selectedEvent.id}/status`, {
        status: "CANCELLED",
        cancellationReason: finalReason,
      });

      setToast({ message: "Pomyślnie odwołano wizytę.", type: "success" });
      setSelectedEvent(null);
      fetchData(true);
    } catch (error: any) {
      console.error("Błąd podczas odwoływania wizyty:", error);
      setToast({
        message: error.response?.data?.error || "Nie udało się odwołać wizyty.",
        type: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mój harmonogram wizyt
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Przeglądaj swoje nadchodzące oraz historyczne sesje terapeutyczne
              w widoku kalendarza. Kliknij wydarzenie, aby zobaczyć szczegóły
              lub odwołać wizytę.
            </p>
          </div>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center text-emerald-600 animate-pulse">
              Ładowanie Twojego kalendarza...
            </div>
          ) : (
            <ScheduleCalendar
              events={events}
              isTherapist={false}
              onEventClick={(event) => setSelectedEvent(event)}
            />
          )}
        </div>
      </div>

      {selectedEvent && (
        <PatientAppointmentModal
          event={selectedEvent}
          isActionLoading={isActionLoading}
          onClose={() => setSelectedEvent(null)}
          onCancel={handleCancelAppointment}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
