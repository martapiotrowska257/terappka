"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "@/src/lib/api";
import Toast from "@/src/components/Toast";
import { ToastType } from "@/src/types/toast";

interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  therapistId: string | null;
}

export default function TerapeutaPacjenciPage() {
  const { data: session } = useSession();
  const [myPatients, setMyPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastType | null>(null);

  const fetchPatientsData = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const resMy = await api.get("/api/users?assigned_only=true");
      setMyPatients(resMy.data);

      const resAll = await api.get("/api/users");
      setAllPatients(resAll.data);
    } catch (error) {
      console.error("Błąd pobierania list pacjentów:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, [session]);

  const handleAssignPatient = async (patientId: string) => {
    setActionLoading(patientId);
    try {
      const res = await api.post(`/api/users/${patientId}/assign`);
      if (res.status === 200) {
        setToast({
          message: "Pomyślnie przypisano pacjenta!",
          type: "success",
        });
        await fetchPatientsData();
      }
    } catch (error: any) {
      console.error("Błąd przypisywania pacjenta:", error);
      setToast({
        message:
          error.response?.data?.error || "Wystąpił błąd podczas przypisywania.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className=" flex items-center justify-center ">
        <div className="text-emerald-600 font-medium text-lg">
          Ładowanie listy pacjentów...
        </div>
      </div>
    );
  }

  const displayedPatients = activeTab === "my" ? myPatients : allPatients;

  return (
    <div className="  p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Panel Zarządzania Pacjentami
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Przeglądaj swoich podopiecznych lub przypisuj nowych użytkowników
              systemu.
            </p>
          </div>
        </header>

        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveTab("my")}
            className={`pb-3 text-lg font-medium border-b-2 px-2 transition-all ${
              activeTab === "my"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Moi pacjenci ({myPatients.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-lg font-medium border-b-2 px-2 transition-all ${
              activeTab === "all"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Wszyscy pacjenci w systemie ({allPatients.length})
          </button>
        </div>

        {displayedPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm text-gray-400">
            {activeTab === "my"
              ? "Nie masz jeszcze przypisanych żadnych pacjentów. Przejdź do zakładki bazy, aby kogoś dodać."
              : "Brak zarejestrowanych pacjentów w systemie."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPatients.map((patient) => {
              const isAlreadyMine = myPatients.some((p) => p.id === patient.id);

              return (
                <div
                  key={patient.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-800">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-gray-500 text-sm">{patient.email}</div>

                    <div className="pt-1">
                      {patient.therapistId ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isAlreadyMine
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {isAlreadyMine
                            ? "Twój pacjent"
                            : "Ma innego terapeutę"}
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Brak przypisanego terapeuty
                        </span>
                      )}
                    </div>
                  </div>

                  {activeTab === "all" && !patient.therapistId && (
                    <button
                      onClick={() => handleAssignPatient(patient.id)}
                      disabled={actionLoading !== null}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === patient.id
                        ? "Przypisywanie..."
                        : "Przypisz do mnie"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
