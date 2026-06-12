"use client";

import { useState } from "react";
import api from "@/src/lib/api";
import type { AppointmentEvent } from "@/src/components/ScheduleCalendar";
import type { User } from "@/src/types/user";

const formatDateToISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatTimeToHHMM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

interface AppointmentControlPanelProps {
  selectedEvent: AppointmentEvent | null;
  selectedSlotDate: Date | null;
  events: AppointmentEvent[];
  patients: User[];
  onCloseEvent: () => void;
  onRefresh: () => void;
}

export default function AppointmentControlPanel({
  selectedEvent,
  selectedSlotDate,
  events,
  patients,
  onCloseEvent,
  onRefresh,
}: AppointmentControlPanelProps) {
  const [formDate, setFormDate] = useState(formatDateToISO(new Date()));
  const [formTime, setFormTime] = useState("10:00");
  const [formMode, setFormMode] = useState<"AVAILABLE" | "SCHEDULED">(
    "AVAILABLE",
  );
  const [formPatientId, setFormPatientId] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [prevSlotDate, setPrevSlotDate] = useState<Date | null>(
    selectedSlotDate,
  );

  if (selectedSlotDate !== prevSlotDate) {
    setPrevSlotDate(selectedSlotDate);
    if (selectedSlotDate) {
      setFormDate(formatDateToISO(selectedSlotDate));
      setFormTime(formatTimeToHHMM(selectedSlotDate));
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetTime = new Date(`${formDate}T${formTime}`).getTime();
    const targetEnd = targetTime + 50 * 60 * 1000;

    const hasConflict = events.some((ev) => {
      const evStart = ev.start.getTime();
      const evEnd = ev.end.getTime();
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
      onRefresh(); // Odświeżamy dane w głównym komponencie
    } catch (error: any) {
      alert(error.response?.data?.error || "Wystąpił błąd podczas dodawania.");
    }
  };

  const handleDeleteOrCancel = async () => {
    if (!selectedEvent) return;

    try {
      if (selectedEvent.status === "AVAILABLE") {
        await api.delete(`/api/appointments/${selectedEvent.id}`);
        alert("🗑️ Wolny termin usunięty.");
      } else {
        const reason = window.prompt("Podaj powód odwołania wizyty:");
        if (reason === null) return;

        await api.patch(`/api/appointments/${selectedEvent.id}/status`, {
          status: "CANCELLED",
          cancellationReason: reason || "Odwołana przez terapeutę",
        });
        alert("Wizyta została odwołana.");
      }
      onCloseEvent();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się wykonać operacji.");
    }
  };

  // Zwracamy Twój JSX (Widok 1 i Widok 2)
  if (selectedEvent) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative">
        <button
          onClick={onCloseEvent}
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
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Dodaj nowy termin
      </h2>
      <form onSubmit={handleCreateAppointment} className="space-y-4">
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
          {formMode === "AVAILABLE" ? "Dodaj wolny termin" : "Zapisz wizytę"}
        </button>
      </form>
    </div>
  );
}
