"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/src/lib/api";
import Chat from "@/src/components/Chat"; // Nasz uniwersalny komponent!

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function TherapistChatPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pobieramy listę pacjentów przypisanych do tego terapeuty
  useEffect(() => {
    const fetchPatients = async () => {
      if (!session?.accessToken) return;
      try {
        const res = await api.get("/api/users?assigned_only=true");
        setPatients(res.data);
      } catch (error) {
        console.error("Błąd pobierania pacjentów:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [session]);

  return (
    <div className=" bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* NAGŁÓWEK */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Wiadomości</h1>
            <p className="text-gray-500 text-sm mt-1">
              Komunikuj się ze swoimi pacjentami w czasie rzeczywistym.
            </p>
          </div>
        </header>

        {/* GŁÓWNY WIDOK: Podział na listę pacjentów i okno czatu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEWA KOLUMNA: LISTA PACJENTÓW */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[600px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">
              Twoi pacjenci
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="text-emerald-600 animate-pulse px-2 text-sm">
                  Ładowanie listy...
                </div>
              ) : patients.length === 0 ? (
                <div className="text-gray-400 text-sm px-2">
                  Nie masz jeszcze przypisanych pacjentów.
                </div>
              ) : (
                patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      selectedPatient?.id === patient.id
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-100"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-xs opacity-60 truncate mt-0.5">
                      {patient.email}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PRAWA KOLUMNA: OKNO CZATU LUB ZAŚLEPKA */}
          <div className="md:col-span-2">
            {selectedPatient ? (
              /* WYWOŁANIE NASZEGO UNIWERSALNEGO CZATU */
              <Chat
                otherUserId={selectedPatient.id}
                otherUserName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
              />
            ) : (
              /* WIDOK ZACHĘCAJĄCY DO WYBORU PACJENTA */
              <div className="bg-white h-[600px] rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                  💬
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Wybierz konwersację
                </h2>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Zaznacz pacjenta z listy po lewej stronie, aby wyświetlić
                  historię wiadomości i rozpocząć czat na żywo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
