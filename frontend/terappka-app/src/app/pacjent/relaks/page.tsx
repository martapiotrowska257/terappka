import React from "react";
import BreathingExercise from "@/src/components/BreathingExercise";

export default function RelaksPage() {
  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Strefa Relaksu</h1>
        <p className="text-lg text-slate-600 mb-8">
          Usiądź wygodnie. Wykorzystaj to ćwiczenie, aby uspokoić myśli i obniżyć poziom stresu.
        </p>
        
        {/* Wywołanie naszego nowego komponentu */}
        <BreathingExercise />
        
      </div>
    </main>
  );
}