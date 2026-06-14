"use client";

import { useState } from "react";
import api from "@/src/lib/api";
import type { AppointmentEvent } from "@/src/components/ScheduleCalendar";
import type { User } from "@/src/types/user";
import Toast from "@/src/components/Toast";
import { formatDateToISO, formatTimeToHHMM } from "../lib/time";
import { ToastType } from "../types/toast";

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
  const [formDuration, setFormDuration] = useState<number>(50);
  const [formPatientId, setFormPatientId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastType | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<"CANCELLED" | "NO_SHOW">(
    "CANCELLED",
  );
  const [cancelReason, setCancelReason] = useState("");

  const [prevSlotDate, setPrevSlotDate] = useState<Date | null>(
    selectedSlotDate,
  );
  const [prevSelectedEvent, setPrevSelectedEvent] =
    useState<AppointmentEvent | null>(selectedEvent);

  if (selectedSlotDate !== prevSlotDate) {
    setPrevSlotDate(selectedSlotDate);
    if (selectedSlotDate) {
      setFormDate(formatDateToISO(selectedSlotDate));
      setFormTime(formatTimeToHHMM(selectedSlotDate));
      setFormError(null);
    }
  }

  if (selectedEvent !== prevSelectedEvent) {
    setPrevSelectedEvent(selectedEvent);
    setIsCancelling(false);
    setCancelStatus("CANCELLED");
    setCancelReason("");
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetTime = new Date(`${formDate}T${formTime}`).getTime();
    const targetEnd = targetTime + formDuration * 60 * 1000;

    const hasConflict = events.some((ev) => {
      if (ev.status === "CANCELLED" || ev.status === "NO_SHOW") {
        return false;
      }
      const evStart = ev.start.getTime();
      const evEnd = ev.end.getTime();
      return targetTime < evEnd && targetEnd > evStart;
    });

    if (hasConflict) {
      setFormError("Masz już zaplanowane spotkanie w tych godzinach.");
      return;
    }

    try {
      await api.post("/api/appointments", {
        dateTime: new Date(`${formDate}T${formTime}`).toISOString(),
        duration: formDuration,
        patientId: formMode === "SCHEDULED" ? formPatientId : undefined,
        description: formDescription,
      });

      setFormDescription("");
      setFormDuration(50);
      setToast({ message: "Dodano do kalendarza!", type: "success" });
      onRefresh();
    } catch (error: any) {
      setFormError(
        error.response?.data?.error || "Wystąpił błąd podczas dodawania.",
      );
    }
  };

  const handleDeleteAvailable = async () => {
    if (!selectedEvent) return;
    try {
      await api.delete(`/api/appointments/${selectedEvent.id}`);
      setToast({ message: "Wolny termin usunięty.", type: "success" });
      onCloseEvent();
      onRefresh();
    } catch (error) {
      console.error(error);
      setToast({ message: "Nie udało się usunąć terminu.", type: "error" });
    }
  };

  const submitCancellation = async () => {
    if (!selectedEvent) return;

    try {
      const finalReason =
        cancelStatus === "NO_SHOW"
          ? "Pacjent nie zjawił się"
          : cancelReason.trim() || "Odwołana przez terapeutę";

      await api.patch(`/api/appointments/${selectedEvent.id}/status`, {
        status: cancelStatus,
        cancellationReason: finalReason,
      });

      setToast({ message: "Wizyta została odwołana.", type: "success" });
      onCloseEvent();
      onRefresh();
    } catch (error) {
      console.error(error);
      setToast({ message: "Nie udało się odwołać wizyty.", type: "error" });
    }
  };

  if (selectedEvent) {
    return (
      <>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative">
          <button
            onClick={onCloseEvent}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            ✕ Zamknij
          </button>

          {isCancelling ? (
            <div>
              <h2 className="text-lg font-bold text-red-600 mb-4 border-b border-red-100 pb-2">
                Odwoływanie wizyty
              </h2>

              <div className="mb-6 space-y-2 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                <p>
                  <strong>Wizyta:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Czas:</strong> {formatDateToISO(selectedEvent.start)}{" "}
                  o {formatTimeToHHMM(selectedEvent.start)}
                </p>
              </div>

              <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setCancelStatus("CANCELLED")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${cancelStatus === "CANCELLED" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
                >
                  Odwołaj wizytę
                </button>
                <button
                  type="button"
                  onClick={() => setCancelStatus("NO_SHOW")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${cancelStatus === "NO_SHOW" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500"}`}
                >
                  Nieobecność
                </button>
              </div>

              {cancelStatus === "CANCELLED" && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Powód odwołania (opcjonalny)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Np. Nagła sytuacja losowa..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm h-20 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Jeśli zostawisz puste, wpiszemy &quot;Odwołana przez
                    terapeutę&quot;.
                  </p>
                </div>
              )}

              {cancelStatus === "NO_SHOW" && (
                <div className="mb-6 text-sm text-gray-500 text-center italic">
                  Status wizyty zostanie zmieniony na &quot;Pacjent nie zjawił
                  się&quot;.
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsCancelling(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Wróć
                </button>
                <button
                  onClick={submitCancellation}
                  className="flex-1 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Potwierdź
                </button>
              </div>
            </div>
          ) : (
            <div>
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
                      Czas trwania
                    </div>
                    <div className="font-medium text-gray-800">
                      {formatTimeToHHMM(selectedEvent.start)} -{" "}
                      {formatTimeToHHMM(selectedEvent.end)}
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
                          : selectedEvent.status === "NO_SHOW"
                            ? "🚫 Odwołana (Nieobecność)"
                            : selectedEvent.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                    Notatki
                  </div>
                  <div
                    className={`font-medium text-sm mt-1 p-2 rounded-md ${selectedEvent.description ? "text-gray-800  border border-gray-100" : "text-gray-400 italic"}`}
                  >
                    {selectedEvent.description || "Brak notatek"}
                  </div>
                </div>
                {(selectedEvent.status === "CANCELLED" ||
                  selectedEvent.status === "NO_SHOW") && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                      Powód odwołania wizyty
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {selectedEvent.cancellationReason ||
                        "Brak podanego powodu"}
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.status === "AVAILABLE" && (
                <button
                  onClick={handleDeleteAvailable}
                  className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                  Usuń wolny termin
                </button>
              )}
              {selectedEvent.status === "SCHEDULED" && (
                <button
                  onClick={() => setIsCancelling(true)}
                  className="w-full py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-medium transition-colors"
                >
                  Odwołaj wizytę
                </button>
              )}
            </div>
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
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
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => {
                  setFormDate(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Godzina
              </label>
              <input
                type="time"
                required
                value={formTime}
                onChange={(e) => {
                  setFormTime(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Długość
              </label>
              <select
                value={formDuration}
                onChange={(e) => {
                  setFormDuration(Number(e.target.value));
                  setFormError(null);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={50}>50 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>

          {formError && (
            <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
              <p className="leading-snug">{formError}</p>
            </div>
          )}

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
