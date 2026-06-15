"use client";

import { useState } from "react";

// Przykładowa baza afirmacji (w przyszłości możesz je pobierać z API)
const AFFIRMATIONS = [
  "Zasługuję na spokój i odpoczynek, niezależnie od tego, ile dzisiaj zrobiłem/am.",
  "Moje uczucia są ważne, a ja akceptuję je dokładnie takimi, jakie są.",
  "Z każdym wdechem przyjmuję spokój, z każdym wydechem uwalniam napięcie.",
  "Mam w sobie siłę i mądrość, by poradzić sobie z dzisiejszymi wyzwaniami.",
  "Wybaczam sobie błędy, ponieważ jestem w procesie ciągłego uczenia się i rozwoju.",
  "Moja wartość nie zależy od mojej produktywności.",
  "Jestem wystarczający/a dokładnie taki/a, jaki/a jestem w tej chwili.",
  "Pozwalam sobie na odpuszczenie tego, na co nie mam wpływu.",
];

export default function AfirmacjePage() {
  const [currentAffirmation, setCurrentAffirmation] = useState(AFFIRMATIONS[0]);
  const [isFading, setIsFading] = useState(false);

  const handleDrawAffirmation = () => {
    setIsFading(true);

    // Prosta animacja zanikania przed zmianą tekstu
    setTimeout(() => {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
      } while (AFFIRMATIONS[randomIndex] === currentAffirmation); // Zapobiega wylosowaniu tej samej

      setCurrentAffirmation(AFFIRMATIONS[randomIndex]);
      setIsFading(false);
    }, 300);
  };

  return (
    <div className="  p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* NAGŁÓWEK */}
        <header className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-300 to-teal-500"></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 mt-2">
            Strefa Afirmacji
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Zatrzymaj się na chwilę. Przeczytaj poniższe słowa powoli i pozwól
            im wybrzmieć w Twojej głowie. Afirmacje pomagają przeprogramować
            negatywne myślenie i budować wewnętrzny spokój.
          </p>
        </header>

        {/* GŁÓWNA AFIRMACJA (INTERAKTYWNA) */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 md:p-12 shadow-lg text-center text-white relative">
          <span className="text-6xl opacity-20 absolute top-4 left-6">❝</span>
          <span className="text-6xl opacity-20 absolute bottom-0 right-6 rotate-180">
            ❝
          </span>

          <div className="min-h-[120px] flex items-center justify-center">
            <h2
              className={`text-2xl md:text-3xl font-medium leading-relaxed transition-opacity duration-300 px-8 ${isFading ? "opacity-0" : "opacity-100"}`}
            >
              {currentAffirmation}
            </h2>
          </div>

          <button
            onClick={handleDrawAffirmation}
            className="mt-8 px-8 py-3 bg-white text-emerald-700 font-bold rounded-full shadow-md hover:shadow-lg hover:bg-emerald-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Wylosuj inną afirmację ✨
          </button>
        </section>

        {/* KATEGORIE AFIRMACJI (STATYCZNE - DO ROZBUDOWY) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🌊
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Redukcja Stresu</h3>
            <p className="text-sm text-gray-500">
              Afirmacje pomagające w chwilach dużego napięcia i lęku.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ❤️
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Miłość do Siebie</h3>
            <p className="text-sm text-gray-500">
              Wzmacnianie poczucia własnej wartości i akceptacji.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🌙
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Spokojny Sen</h3>
            <p className="text-sm text-gray-500">
              Wyciszające myśli idealne do przeczytania przed snem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
