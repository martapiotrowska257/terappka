"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/src/lib/api";
import Chat from "@/src/components/Chat"; // Importujemy Twój nowy uniwersalny czat

// Definiujemy interfejs na podstawie tego, co zwraca endpoint /api/users/therapist
interface Therapist {
  id: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function PatientChatPage() {
  const { data: session } = useSession();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!session?.accessToken) return;
      try {
        const res = await api.get("/api/users/therapist");
        setTherapist(res.data);
      } catch (error) {
        console.error("Błąd pobierania danych terapeuty:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapist();
  }, [session]);

  return (
    <div className="  p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* NAGŁÓWEK STRONY */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Czat z terapeutą
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Tutaj możesz skontaktować się ze swoim przypisanym specjalistą w
              czasie rzeczywistym.
            </p>
          </div>
        </header>

        {/* LOGIKA WYŚWIETLANIA CZATU */}
        {isLoading ? (
          <div className="bg-white h-[600px] rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <div className="text-emerald-600 font-medium animate-pulse">
              Nawiązywanie bezpiecznego połączenia...
            </div>
          </div>
        ) : therapist?.id ? (
          /* WYWOŁANIE NASZEGO UNIWERSALNEGO KOMPONENTU */
          <Chat
            otherUserId={therapist.id}
            otherUserName={`${therapist.firstName} ${therapist.lastName}`}
          />
        ) : (
          /* WIDOK GDY PACJENT NIE MA TERAPEUTY */
          <div className="bg-white h-[500px] rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24  rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
              📭
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Brak przypisanego terapeuty
            </h2>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Nie zostałeś jeszcze przypisany do żadnego terapeuty w naszym
              systemie. Gdy opiekun zaakceptuje Twój profil, w tym miejscu
              pojawi się możliwość bezpośredniej komunikacji na czacie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
