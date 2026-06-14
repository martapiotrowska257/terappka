"use client";

import { useState, useEffect, useCallback } from "react";
import ScheduleCalendar, {
  AppointmentEvent,
} from "@/src/components/ScheduleCalendar";
import api from "@/src/lib/api";
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";
import { formatDate } from "@/src/lib/time";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PatientCalendarPage() {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null,
  );

  // Pobieranie danych (identycznie jak u terapeuty)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/appointments");

      const mappedEvents: AppointmentEvent[] = res.data.map(
        (app: Appointment) => {
          // Zabezpieczenie strefy czasowej (doklejamy 'Z' jeśli brakuje)
          const dateString = app.dateTime.endsWith("Z")
            ? app.dateTime
            : `${app.dateTime}Z`;
          const startDate = new Date(dateString);

          // Wyliczanie czasu trwania
          const duration = app.duration || 50;
          const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

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
          };
        },
      );

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Błąd pobierania wizyt:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mój harmonogram wizyt
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Przeglądaj swoje nadchodzące oraz historyczne sesje terapeutyczne
              w widoku kalendarza. Kliknij wydarzenie, aby zobaczyć szczegóły.
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

      {/* MODAL ZE SZCZEGÓŁAMI WIZYTY */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative transform transition-all"
            style={{ animation: "popUp 0.3s ease-out forwards" }}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-medium"
            >
              ✕ Zamknij
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
              Szczegóły wizyty
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Tytuł
                </div>
                <div className="font-medium text-gray-800">
                  {selectedEvent.title}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Terapeuta
                </div>
                <div className="font-medium text-gray-800">
                  {selectedEvent.therapistName || "Nie przypisano"}
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Data
                  </div>
                  <div className="font-medium text-gray-800 capitalize">
                    {formatDate(selectedEvent.start)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Godzina
                  </div>
                  <div className="font-medium text-gray-800">
                    {formatTime(selectedEvent.start)} -{" "}
                    {formatTime(selectedEvent.end)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div className="font-medium mt-1">
                  {selectedEvent.status === "SCHEDULED" && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm">
                      🔵 Zaplanowana
                    </span>
                  )}
                  {selectedEvent.status === "CONFIRMED" && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm">
                      🔵 Potwierdzona
                    </span>
                  )}
                  {selectedEvent.status === "COMPLETED" && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm">
                      ⚪ Zakończona
                    </span>
                  )}
                  {selectedEvent.status === "CANCELLED" && (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm">
                      🔴 Odwołana
                    </span>
                  )}
                  {selectedEvent.status === "NO_SHOW" && (
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-sm">
                      🚫 Nieobecność
                    </span>
                  )}
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                    Notatki dla pacjenta
                  </div>
                  <div className="font-medium text-sm mt-1 p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Rozumiem
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes popUp {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
