"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/src/lib/api";
import {
  getLocalISODate,
  getPrevDay,
  getNextDay,
  isToday,
  formatDate,
} from "@/src/lib/time";

export default function PamietnikPage() {
  const { data: session } = useSession();
  const [entry, setEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [question, setQuestion] = useState("Ładowanie pytania...");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;

      setQuestion("Ładowanie pytania...");
      setEntry("");
      setSaveStatus("idle");

      const formattedDate = getLocalISODate(selectedDate);

      try {
        const resQuestion = await api.get(
          `/api/diary/question?date=${formattedDate}`,
        );

        setQuestion(resQuestion.data.question || "Brak pytania na ten dzień.");
      } catch (error) {
        console.error("Błąd pobierania pytania:", error);
        setQuestion("Błąd połączenia z serwerem.");
      }

      try {
        const resEntry = await api.get(`/api/diary?date=${formattedDate}`);

        setEntry(resEntry.data.content || "");
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          setEntry("");
        } else {
          console.error("Błąd połączenia z API (Pobieranie wpisu):", error);
        }
      }
    };

    fetchData();
  }, [selectedDate, session]);

  const handleSaveEntry = async () => {
    if (!session?.accessToken) {
      alert("Musisz być zalogowany, aby zapisać wpis.");
      return;
    }

    if (!entry.trim()) {
      alert("Nie możesz zapisać pustego wpisu.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await api.post("/api/diary", {
        question: question,
        content: entry,
        date: getLocalISODate(selectedDate),
      });

      if (res.status === 200 || res.status === 201) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Błąd połączenia z API (Zapis):", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const prevDate = getPrevDay(selectedDate);
  const nextDate = getNextDay(selectedDate);
  const isCurrentDay = isToday(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Pasek nawigacyjny pamiętnika */}
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

        <div className="text-lg md:text-xl font-bold text-emerald-800 border-b border-emerald-800/30 px-4 pb-1 text-center min-w-[150px]">
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
            disabled={isSaving}
            className="flex-1 w-full resize-none bg-transparent font-serif text-gray-700 text-lg md:text-xl focus:outline-none focus:ring-0 p-0 disabled:opacity-75"
            placeholder="Zacznij przelewać tutaj swoje myśli..."
            style={{
              backgroundImage:
                "linear-gradient(transparent 31px, #e5e7eb 32px)",
              backgroundSize: "100% 32px",
              lineHeight: "32px",
            }}
          ></textarea>

          <div className="mt-8 flex items-center justify-between">
            <div className="font-serif text-sm">
              {saveStatus === "success" && (
                <span className="text-emerald-600 font-medium animate-pulse">
                  ✓ Pomyślnie zapisano wpis!
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-500 font-medium">
                  ✕ Wystąpił błąd podczas zapisu.
                </span>
              )}
            </div>

            <button
              onClick={handleSaveEntry}
              disabled={isSaving}
              className={`font-serif px-8 py-3 rounded-md transition-all shadow-md text-white ${
                isSaving
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-emerald-400 hover:bg-emerald-500 cursor-pointer"
              }`}
            >
              {isSaving ? "Zapisywanie..." : "Zapisz wpis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
