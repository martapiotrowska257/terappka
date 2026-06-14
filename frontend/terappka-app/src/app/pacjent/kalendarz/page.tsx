"use client";

import { useState, useEffect, useCallback } from "react";
import ScheduleCalendar, {
  AppointmentEvent,
} from "@/src/components/ScheduleCalendar";
import api from "@/src/lib/api";
import Toast from "@/src/components/Toast"; // <-- Importujemy Twój komponent Toast
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";
import { formatDate } from "@/src/lib/time";
import io from "socket.io-client";
import { useSession } from "next-auth/react";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PatientCalendarPage() {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null,
  );

  // --- STANY ODWOŁYWANIA WIZYTY ---
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // --- STAN DLA TOASTU ---
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Pobieranie grafiku pacjenta
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true); // Ekran ładowania blokuje widok TYLKO przy pierwszym wejściu
    }
    try {
      const res = await api.get("/api/appointments");

      const mappedEvents: AppointmentEvent[] = res.data.map(
        (app: Appointment) => {
          const dateString = app.dateTime.endsWith("Z")
            ? app.dateTime
            : `${app.dateTime}Z`;
          const startDate = new Date(dateString);

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
            cancellationReason: app.cancellationReason,
          };
        },
      );

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Błąd pobierania wizyt:", error);
    } finally {
      if (!isSilent) {
        setIsLoading(false); // Zdejmujemy loader TYLKO jeśli to nie było ciche odświeżanie
      }
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // --- LOGIKA WEBSOCKET: Reaktywny kalendarz ---
  useEffect(() => {
    if (!session?.accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const socket = io(apiUrl, { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("authenticate", { token: session.accessToken });
    });

    socket.on("calendar_updated", () => {
      console.log(
        "🔄 Otrzymano sygnał z backendu! Odświeżam kalendarz w tle...",
      );
      fetchData(true); // Przekazujemy TRUE, kalendarz nie zniknie z ekranu!
    });

    return () => {
      socket.disconnect();
    };
  }, [session, fetchData]);

  // Funkcja otwierająca szczegóły wizyty (resetuje stany odwołania)
  const handleEventClick = (event: AppointmentEvent) => {
    setSelectedEvent(event);
    setIsCancelling(false);
    setCancelReason("");
  };

  // Logika wysyłania żądania anulowania wizyty do API
  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;

    setIsActionLoading(true);
    try {
      // Backend wymaga niepustego powrotu, więc w razie braku wpisu dajemy fallback
      const finalReason = cancelReason.trim() || "Odwołana przez pacjenta";

      await api.patch(`/api/appointments/${selectedEvent.id}/status`, {
        status: "CANCELLED",
        cancellationReason: finalReason,
      });

      setToast({ message: "Pomyślnie odwołano wizytę.", type: "success" });
      setSelectedEvent(null); // Zamykamy modal
      fetchData(); // Odświeżamy kalendarz
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
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
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative transform transition-all"
            style={{ animation: "popUp 0.3s ease-out forwards" }}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-medium"
              disabled={isActionLoading}
            >
              ✕ Zamknij
            </button>

            {isCancelling ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-red-600 border-b border-red-100 pb-3">
                  Odwoływanie wizyty
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Czy na pewno chcesz odwołać zaplanowaną sesję z dnia{" "}
                  <strong>{formatDate(selectedEvent.start)}</strong> o godzinie{" "}
                  <strong>{formatTime(selectedEvent.start)}</strong>?
                </p>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Powód odwołania spotkania (opcjonalny)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Np. Zmiana planów, wyjazd, choroba..."
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm h-24 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Pozostawienie pustego pola zapisze powód jako &quot;Odwołana
                    przez pacjenta&quot;.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCancelling(false)}
                    disabled={isActionLoading}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Wróć
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAppointment}
                    disabled={isActionLoading}
                    className="flex-1 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-colors shadow-md disabled:opacity-50"
                  >
                    {isActionLoading ? "Odwoływanie..." : "Potwierdź odwołanie"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
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
                {(selectedEvent.status === "CANCELLED" ||
                  selectedEvent.status === "NO_SHOW") && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      Powód odwołania wizyty
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {selectedEvent.cancellationReason ||
                        "Brak podanego powodu"}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                  {(selectedEvent.status === "SCHEDULED" ||
                    selectedEvent.status === "CONFIRMED") && (
                    <button
                      onClick={() => setIsCancelling(true)}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-medium transition-colors"
                    >
                      Odwołaj wizytę
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            )}
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

      {/* GLOBALNE WYŚWIETLENIE TOASTÓW */}
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
