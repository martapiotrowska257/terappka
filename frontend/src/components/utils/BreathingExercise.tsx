"use client";

import { Phase, PHASE_CONFIG } from "@/src/types/utils";
import { useState, useEffect } from "react";

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(120);

  const [step, setStep] = useState<{ phase: Phase; time: number }>({
    phase: "Wdech",
    time: PHASE_CONFIG["Wdech"].duration,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTotalTime((prevTotal) => {
          if (prevTotal <= 1) {
            setIsActive(false);
            return 0;
          }
          return prevTotal - 1;
        });

        setStep((prevStep) => {
          if (prevStep.time <= 1) {
            const nextPhase = PHASE_CONFIG[prevStep.phase].next;
            return {
              phase: nextPhase,
              time: PHASE_CONFIG[nextPhase].duration,
            };
          }
          return { ...prevStep, time: prevStep.time - 1 };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const resetExercise = () => {
    setIsActive(false);
    setTotalTime(120);
    setStep({ phase: "Wdech", time: PHASE_CONFIG["Wdech"].duration });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-slate-700 mb-2">
        Chwila na oddech
      </h2>
      <p className="text-slate-500 mb-12">
        Pozostały czas:{" "}
        <span className="font-mono font-semibold">{formatTime(totalTime)}</span>
      </p>

      <div className="relative flex items-center justify-center w-64 h-64 mb-12">
        <div
          className="absolute w-32 h-32 bg-teal-200 rounded-full opacity-70"
          style={{
            transform: `scale(${PHASE_CONFIG[step.phase].scale})`,
            transition: `transform ${PHASE_CONFIG[step.phase].duration}s linear`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {totalTime > 0 ? (
            <>
              <span className="text-3xl font-bold text-teal-800 tracking-wide">
                {isActive ? step.phase : "Gotowy?"}
              </span>
              {isActive && (
                <span className="text-xl font-medium text-teal-700 mt-2">
                  {step.time}
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
