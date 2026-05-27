"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PamietnikPage() {
  const { data: session } = useSession();
  const [entry, setEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [question, setQuestion] = useState("Ładowanie pytania...");

  const getPrevDay = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
  };

  const getNextDay = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      // Zabezpieczenie: jeśli nie ma tokenu, nie robimy zapytania
      if (!session?.accessToken) return;

      setQuestion("Ładowanie pytania..."); // Reset podczas zmiany daty

      try {
        // Opcjonalnie: Jeśli Twój backend potrafi przyjąć datę w parametrze,
        // możesz ją dokleić, np.: ?date=${selectedDate.toISOString().split('T')[0]}
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
        const res = await fetch(`${apiUrl}/api/diary/question`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Zakładamy, że backend zwraca { "question": "Treść pytania..." }
          setQuestion(data.question || "Brak pytania na ten dzień.");
        } else {
          console.error("Błąd pobierania pytania:", res.status);
          setQuestion("Nie udało się pobrać pytania na ten dzień.");
        }
      } catch (error) {
        console.error("Błąd połączenia z API (Pytanie):", error);
        setQuestion("Błąd połączenia z serwerem.");
      }
    };

    fetchQuestion();
  }, [selectedDate, session]);

  const prevDate = getPrevDay(selectedDate);
  const nextDate = getNextDay(selectedDate);
  const isCurrentDay = isToday(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Pasek nawigacyjny pamiętnika (Nad okładką) */}
      <div className="w-full max-w-3xl flex justify-center items-center gap-4 md:gap-12 mb-8 font-serif text-gray-500">
        <button
          onClick={() => setSelectedDate(prevDate)}
          className="flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">
            &lsaquo;
          </span>
          <span className="hidden sm:inline">{formatDate(prevDate)}</span>
          <span className="sm:hidden">
            {prevDate.toLocaleDateString("pl-PL")}
          </span>
        </button>

        {/* Aktualnie wybrany dzień (środek) */}
        <div className="text-lg md:text-xl font-bold text-emerald-600 border-b border-emerald-600/30 px-4 pb-1 text-center min-w-[150px]">
          {isCurrentDay ? "Dzisiaj" : formatDate(selectedDate)}
        </div>

        {!isCurrentDay ? (
          <button
            onClick={() => setSelectedDate(nextDate)}
            className="flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer group"
          >
            <span className="hidden sm:inline">{formatDate(nextDate)}</span>
            <span className="sm:hidden">
              {nextDate.toLocaleDateString("pl-PL")}
            </span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">
              &rsaquo;
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 invisible">
            <span className="hidden sm:inline">{formatDate(nextDate)}</span>
            <span className="sm:hidden">
              {nextDate.toLocaleDateString("pl-PL")}
            </span>
            <span className="text-2xl">&rsaquo;</span>
          </div>
        )}
      </div>

      {/* Główny kontener książki */}
      <div className="w-full max-w-3xl bg-[#fdfbf7] shadow-2xl rounded-r-3xl rounded-l-sm border-l-[16px] border-emerald-100 min-h-[700px] flex flex-col relative transition-all duration-300">
        <div className="p-8 md:p-12 flex-1 flex flex-col">
          <div className="flex justify-between items-end border-b-2 border-gray-200 pb-2 mb-10">
            <span className="font-serif text-gray-400 italic">Pamiętnik</span>
            <span className="font-serif text-gray-500 tracking-wide text-sm">
              {selectedDate.toLocaleDateString("pl-PL")}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-10 text-center px-4 leading-relaxed">
            {question}
          </h2>

          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="flex-1 w-full resize-none bg-transparent font-serif text-gray-700 text-lg md:text-xl focus:outline-none focus:ring-0 p-0"
            placeholder="Zacznij przelewać tutaj swoje myśli..."
            style={{
              backgroundImage:
                "linear-gradient(transparent 31px, #e5e7eb 32px)",
              backgroundSize: "100% 32px",
              lineHeight: "32px",
            }}
          ></textarea>

          <div className="mt-8 flex justify-end">
            <button className="bg-emerald-400 hover:bg-emerald-500 text-white font-serif px-8 py-3 rounded-md transition-colors shadow-md">
              Zapisz wpis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
