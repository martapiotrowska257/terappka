"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import api from "@/src/lib/api";
import Toast from "@/src/components/utils/Toast";
import { ToastType } from "@/src/types/toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EmotionEntry, PrimaryEmotion } from "@/src/types/emotions";
import { EMOTION_TREE } from "@/src/lib/utils";

export default function EmotionsPage() {
  const { data: session } = useSession();

  const [selectedPrimary, setSelectedPrimary] = useState<PrimaryEmotion | null>(
    null,
  );
  const [selectedSecondary, setSelectedSecondary] = useState<string | null>(
    null,
  );

  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await api.get("/api/emotions");
      setHistory(res.data);
    } catch (error) {
      console.error("Błąd pobierania historii emocji:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async () => {
    if (!selectedPrimary || !selectedSecondary) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/emotions", {
        primaryEmotion: selectedPrimary,
        secondaryEmotion: selectedSecondary,
      });

      setToast({ message: "Twój nastrój został zapisany!", type: "success" });
      setSelectedPrimary(null);
      setSelectedSecondary(null);
      fetchHistory();
    } catch (error) {
      console.error(error);
      setToast({ message: "Nie udało się zapisać nastroju.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = history.map((entry) => {
    let score = 2;
    if (entry.primaryEmotion === "Pozytywnie") score = 3;
    if (entry.primaryEmotion === "Negatywnie") score = 1;

    return {
      date: new Date(entry.createdAt).toLocaleDateString("pl-PL", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      score: score,
      detail: entry.secondaryEmotion,
      primary: entry.primaryEmotion,
    };
  });

  return (
    <div className="w-full h-full bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mój Nastrój</h1>
          <p className="text-gray-500 max-w-2xl">
            Codzienne logowanie emocji pozwala dostrzec wzorce w Twoim
            samopoczuciu. Jak się dzisiaj czujesz?
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Krok 1: Ogólny stan
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {(
                ["Pozytywnie", "Neutralnie", "Negatywnie"] as PrimaryEmotion[]
              ).map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => {
                    setSelectedPrimary(emotion);
                    setSelectedSecondary(null);
                  }}
                  className={`p-4 rounded-2xl border-2 font-medium flex flex-col items-center gap-2 transition-all ${
                    selectedPrimary === emotion
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-3xl">
                    {emotion === "Pozytywnie"
                      ? "😊"
                      : emotion === "Neutralnie"
                        ? "😐"
                        : "🌧️"}
                  </span>
                  <span className="text-sm">{emotion}</span>
                </button>
              ))}
            </div>

            {selectedPrimary && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-6">
                  Krok 2: Co dokładnie czujesz?
                </h2>
                <div className="flex flex-wrap gap-3 mb-8">
                  {EMOTION_TREE[selectedPrimary].map((subEmotion) => (
                    <button
                      key={subEmotion}
                      onClick={() => setSelectedSecondary(subEmotion)}
                      className={`px-5 py-2.5 rounded-full font-medium transition-colors text-sm border ${
                        selectedSecondary === subEmotion
                          ? "bg-gray-800 text-white border-gray-800 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {subEmotion.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedSecondary || isSubmitting}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz w dzienniku"}
                </button>
              </div>
            )}
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Twój trend</h2>

            <div className="flex-1 min-h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-emerald-600 animate-pulse">
                  Ładowanie wykresu...
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <span className="text-4xl mb-3">📈</span>
                  <p>Brak danych.</p>
                  <p className="text-sm">
                    Dodaj swój pierwszy wpis, aby zobaczyć wykres.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0.5, 3.5]}
                      ticks={[1, 2, 3]}
                      tickFormatter={(val) =>
                        val === 3 ? "Pozytywnie" : val === 2 ? "Neutral" : "Zle"
                      }
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        props.payload.detail,
                        props.payload.primary,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={{
                        r: 4,
                        fill: "#10b981",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
