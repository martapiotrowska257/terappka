"use client";

import { useState } from "react";
import { AppointmentEvent } from "@/src/components/calendar/ScheduleCalendar";
import { formatDate, formatTimeToHHMM } from "@/src/lib/time";

interface PatientAppointmentModalProps {
  event: AppointmentEvent;
  isActionLoading: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
}

export default function PatientAppointmentModal({
  event,
  isActionLoading,
  onClose,
  onCancel,
}: PatientAppointmentModalProps) {
  // Stany lokalne - dotyczą tylko tego modala, więc nie muszą zaśmiecać strony głównej!
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleClose = () => {
    if (isActionLoading) return;
    setIsCancelling(false);
    setCancelReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative transform transition-all"
        style={{ animation: "popUp 0.3s ease-out forwards" }}
      >
        <button
          onClick={handleClose}
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
              <strong>{formatDate(event.start)}</strong> o godzinie{" "}
              <strong>{formatTimeToHHMM(event.start)}</strong>?
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
                onClick={() => onCancel(cancelReason)}
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
                <div className="font-medium text-gray-800">{event.title}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Terapeuta
                </div>
                <div className="font-medium text-gray-800">
                  {event.therapistName || "Nie przypisano"}
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Data
                  </div>
                  <div className="font-medium text-gray-800 capitalize">
                    {formatDate(event.start)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Godzina
                  </div>
                  <div className="font-medium text-gray-800">
                    {formatTimeToHHMM(event.start)} -{" "}
                    {formatTimeToHHMM(event.end)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div className="font-medium mt-1">
                  {event.status === "SCHEDULED" && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm">
                      🔵 Zaplanowana
                    </span>
                  )}
                  {event.status === "CONFIRMED" && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm">
                      🔵 Potwierdzona
                    </span>
                  )}
                  {event.status === "COMPLETED" && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm">
                      ⚪ Zakończona
                    </span>
                  )}
                  {event.status === "CANCELLED" && (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm">
                      🔴 Odwołana
                    </span>
                  )}
                  {event.status === "NO_SHOW" && (
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-sm">
                      🚫 Nieobecność
                    </span>
                  )}
                </div>
              </div>

              {event.description && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                    Notatki dla pacjenta
                  </div>
                  <div className="font-medium text-sm mt-1 p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
                    {event.description}
                  </div>
                </div>
              )}

              {["CANCELLED", "NO_SHOW"].includes(event.status) && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                    Powód odwołania wizyty
                  </div>
                  <div className="font-medium text-gray-800 mt-1">
                    {event.cancellationReason || "Brak podanego powodu"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              {(event.status === "SCHEDULED" ||
                event.status === "CONFIRMED") && (
                <button
                  onClick={() => setIsCancelling(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-medium transition-colors"
                >
                  Odwołaj wizytę
                </button>
              )}
              <button
                onClick={handleClose}
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
  );
}
