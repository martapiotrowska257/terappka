"use client";

import { useState, useEffect, useCallback } from "react";
import ScheduleCalendar, {
  AppointmentEvent,
} from "@/src/components/ScheduleCalendar";
import api from "@/src/lib/api";
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";
import { User } from "@/src/types/user";

// Formatowanie daty na YYYY-MM-DD
const formatDateToISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Formatowanie godziny na HH:MM
const formatTimeToHHMM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

export default function TherapistCalendarPage() {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STANY PANELU BOCZNEGO ---
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null,
  );

  // Stany formularza tworzenia (domyślnie dzisiejsza data i 10:00)
  const [formDate, setFormDate] = useState(formatDateToISO(new Date()));
  const [formTime, setFormTime] = useState("10:00");
  const [formMode, setFormMode] = useState<"AVAILABLE" | "SCHEDULED">(
    "AVAILABLE",
  );
  const [formPatientId, setFormPatientId] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pobieramy listę pacjentów
      const resPatients = await api.get("/api/users?assigned_only=true");
      setPatients(resPatients.data);

      // Pobieramy kalendarz
      const resAppointments = await api.get("/api/appointments");
      const mappedEvents: AppointmentEvent[] = resAppointments.data.map(
        (app: Appointment) => {
          const dateString = app.dateTime.endsWith("Z")
            ? app.dateTime
            : `${app.dateTime}Z`;
          const startDate = new Date(dateString);
          const endDate = new Date(startDate.getTime() + 50 * 60 * 1000); // 50 min

          // Szukamy imienia pacjenta (jeśli to wizyta)
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
          };
        },
      );
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- AKCJE KALENDARZA ---

  // Kliknięcie w puste miejsce w kalendarzu UZUPEŁNIA formularz (ale go nie wysyła!)
  const handleSlotSelect = (start: Date) => {
    setSelectedEvent(null); // Odznaczamy wybrane wydarzenie
    setFormDate(formatDateToISO(start));
    setFormTime(formatTimeToHHMM(start));
  };

  // Kliknięcie w istniejące wydarzenie otwiera jego podgląd
  const handleEventClick = (event: AppointmentEvent) => {
    setSelectedEvent(event);
  };

  // --- AKCJE PANELU BOCZNEGO ---

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zabezpieczenie przed dublowaniem (Konflikt czasu)
    const targetTime = new Date(`${formDate}T${formTime}`).getTime();

    // Sprawdzamy czy istnieje wydarzenie, które zaczyna się i kończy w ramach naszych 50 minut
    const targetEnd = targetTime + 50 * 60 * 1000;
    const hasConflict = events.some((ev) => {
      const evStart = ev.start.getTime();
      const evEnd = ev.end.getTime();
      // Warunek nakładania się na siebie
      return targetTime < evEnd && targetEnd > evStart;
    });

    if (hasConflict) {
      alert(
        "⚠️ Konflikt czasu! Masz już zaplanowane spotkanie lub wolny termin w tych godzinach.",
      );
      return;
    }

    try {
      await api.post("/api/appointments", {
        dateTime: new Date(`${formDate}T${formTime}`).toISOString(),
        patientId: formMode === "SCHEDULED" ? formPatientId : undefined,
        description: formDescription,
      });

      setFormDescription("");
      alert("✅ Dodano do kalendarza!");
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Wystąpił błąd podczas dodawania.");
    }
  };

  const handleDeleteOrCancel = async () => {
    if (!selectedEvent) return;

    try {
      if (selectedEvent.status === "AVAILABLE") {
        // Usuwamy wolne okienko całkowicie z bazy używając nowej ścieżki DELETE
        await api.delete(`/api/appointments/${selectedEvent.id}`);
        alert("🗑️ Wolny termin usunięty.");
      } else {
        // Odwołujemy zaplanowaną wizytę (zostaje ślad w bazie i pacjent to widzi)
        const reason = window.prompt("Podaj powód odwołania wizyty:");
        if (reason === null) return;

        await api.patch(`/api/appointments/${selectedEvent.id}/status`, {
          status: "CANCELLED",
          cancellationReason: reason || "Odwołana przez terapeutę",
        });
        alert("Wizyta została odwołana.");
      }
      setSelectedEvent(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Nie udało się wykonać operacji.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Zarządzanie Grafikiem
        </h1>
        <p className="text-gray-500 text-sm">
          Zaznacz godzinę na kalendarzu i dodaj spotkanie w panelu po prawej
          stronie.
        </p>
      </header>

      {/* GŁÓWNY GRID: 2 KOLUMNY NA DUŻYCH EKRANACH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEWA STRONA: KALENDARZ (Zajmuje 2/3 szerokości) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center text-emerald-600 animate-pulse">
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

        {/* PRAWA STRONA: PANEL STEROWANIA (Zajmuje 1/3 szerokości) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Widok 1: Gdy kliknięto w istniejące wydarzenie */}
          {selectedEvent ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                ✕ Zamknij
              </button>

              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Szczegóły zdarzenia
              </h2>

              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Tytuł
                  </div>
                  <div className="font-medium text-gray-800">
                    {selectedEvent.title}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Data
                    </div>
                    <div className="font-medium text-gray-800">
                      {formatDateToISO(selectedEvent.start)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Godzina
                    </div>
                    <div className="font-medium text-gray-800">
                      {formatTimeToHHMM(selectedEvent.start)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Status
                  </div>
                  <div className="font-medium">
                    {selectedEvent.status === "AVAILABLE"
                      ? "🟢 Wolny termin"
                      : selectedEvent.status === "SCHEDULED"
                        ? "🔵 Zaplanowana"
                        : selectedEvent.status === "CANCELLED"
                          ? "🔴 Odwołana"
                          : selectedEvent.status}
                  </div>
                </div>
              </div>

              {/* Akcje zależne od statusu */}
              {selectedEvent.status === "AVAILABLE" && (
                <button
                  onClick={handleDeleteOrCancel}
                  className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                  Usuń wolny termin
                </button>
              )}
              {selectedEvent.status === "SCHEDULED" && (
                <button
                  onClick={handleDeleteOrCancel}
                  className="w-full py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-medium transition-colors"
                >
                  Odwołaj wizytę pacjenta
                </button>
              )}
            </div>
          ) : (
            /* Widok 2: Formularz tworzenia (Wyświetlany, gdy nie wybrano nic z kalendarza) */
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Dodaj nowy termin
              </h2>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                {/* Wybór typu okienka */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormMode("AVAILABLE")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formMode === "AVAILABLE" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}
                  >
                    Wolne okienko
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("SCHEDULED")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formMode === "SCHEDULED" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}
                  >
                    Umów pacjenta
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Godzina startu
                    </label>
                    <input
                      type="time"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {formMode === "SCHEDULED" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Wybierz pacjenta
                    </label>
                    <select
                      required
                      value={formPatientId}
                      onChange={(e) => setFormPatientId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    >
                      <option value="" disabled>
                        -- Lista Twoich pacjentów --
                      </option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notatki (opcjonalne)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-16 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formMode === "SCHEDULED" && !formPatientId}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {formMode === "AVAILABLE"
                    ? "Dodaj wolny termin"
                    : "Zapisz wizytę"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
