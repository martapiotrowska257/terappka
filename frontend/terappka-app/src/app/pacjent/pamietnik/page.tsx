"use client";

import { useState } from "react";

export default function PamietnikPage() {
  const [entry, setEntry] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-[#fdfbf7] shadow-2xl rounded-r-3xl rounded-l-sm border-l-[16px] border-emerald-100 min-h-[700px] flex flex-col relative">
        <div className="p-8 md:p-12 flex-1 flex flex-col">
          <div className="flex justify-between items-end border-b-2 border-gray-200 pb-2 mb-10">
            <span className="font-serif text-gray-400 italic">Pamiętnik</span>
            <span className="font-serif text-gray-500 tracking-wide text-sm">
              {new Date().toLocaleDateString("pl-PL")}
            </span>
          </div>

          {/* Pytanie na twardo */}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-10 text-center px-4 leading-relaxed">
            Tutaj będzie pytanie
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
              Zakończ wpis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
