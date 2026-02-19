"use client";

import React, { useState, useEffect } from "react";

// Definiujemy fazy oddechu i ich konfigurację
type Phase = "Wdech" | "Przytrzymaj" | "Wydech" | "Pauza";

const PHASE_CONFIG: Record<Phase, { duration: number; next: Phase; scale: number }> = {
  Wdech: { duration: 4, next: "Przytrzymaj", scale: 1.5 },
  Przytrzymaj: { duration: 4, next: "Wydech", scale: 1.5 },
  Wydech: { duration: 4, next: "Pauza", scale: 1 },
  Pauza: { duration: 4, next: "Wdech", scale: 1 },
};

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(120); // Domyślnie 2 minuty (120 sekund)
  const [phase, setPhase] = useState<Phase>("Wdech");
  const [phaseTime, setPhaseTime] = useState(PHASE_CONFIG["Wdech"].duration);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && totalTime > 0) {
      interval = setInterval(() => {
        setTotalTime((prevTotal) => prevTotal - 1);
        
        setPhaseTime((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            // Czas na zmianę fazy oddechu
            const nextPhase = PHASE_CONFIG[phase].next;
            setPhase(nextPhase);
            return PHASE_CONFIG[nextPhase].duration;
          }
          return prevPhaseTime - 1;
        });
      }, 1000);
    } else if (totalTime === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, totalTime, phase]);

  // Funkcja resetująca timer do stanu początkowego
  const resetExercise = () => {
    setIsActive(false);
    setTotalTime(120);
    setPhase("Wdech");
    setPhaseTime(PHASE_CONFIG["Wdech"].duration);
  };

  // Formatowanie czasu całkowitego do postaci MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto mt-10">
      
      {/* Nagłówek i główny timer */}
      <h2 className="text-2xl font-bold text-slate-700 mb-2">Chwila na oddech</h2>
      <p className="text-slate-500 mb-12">Pozostały czas: <span className="font-mono font-semibold">{formatTime(totalTime)}</span></p>

      {/* Kontener na animowane koło rodem z Fincha */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-12">
        {/* Koło, które pulsuje w zależności od fazy */}
        <div
          className="absolute w-32 h-32 bg-teal-200 rounded-full opacity-70"
          style={{
            transform: `scale(${PHASE_CONFIG[phase].scale})`,
            // Płynne przejście przez cały czas trwania danej fazy
            transition: `transform ${PHASE_CONFIG[phase].duration}s linear`,
          }}
        />
        
        {/* Tekst na środku koła */}
        <div className="relative z-10 flex flex-col items-center">
          {totalTime > 0 ? (
            <>
              <span className="text-3xl font-bold text-teal-800 tracking-wide">
                {isActive ? phase : "Gotowy?"}
              </span>
              {isActive && (
                <span className="text-xl font-medium text-teal-700 mt-2">
                  {phaseTime}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-teal-800 text-center">
              Świetna robota! 💙
            </span>
          )}
        </div>
      </div>

      {/* Przyciski sterujące */}
      <div className="flex gap-4">
        {totalTime > 0 && (
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              isActive 
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            {isActive ? "Pauzuj" : "Zacznij"}
          </button>
        )}
        <button
          onClick={resetExercise}
          className="px-6 py-3 rounded-full font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
        >
          Resetuj
        </button>
      </div>
      
    </div>
  );
}