// src/app/user/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionTiles from "@/src/components/ActionTiles";
import type { Appointment } from "@/src/types/appointment";

async function getAppointments(token: string): Promise<Appointment[]> {
  const apiUrl = process.env.API_URL || "http://127.0.0.1:5000";

  try {
    const res = await fetch(`${apiUrl}/api/appointments`, {
      method: "GET",
      headers: {
        ["Authorization"]: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Błąd pobierania wizyt:", res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Błąd połączenia z API:", error);
    return [];
  }
}

export default async function PatientDashboard() {
  // 1. Pobranie sesji użytkownika na serwerze
  const session = await getServerSession(authOptions);

  // 2. Podwójne zabezpieczenie (Defense in Depth)
  // Upewniamy się, że to na pewno user (rola 'user').
  // Middleware robi to na poziomie routingu, ale to dobra praktyka.
  if (!session || !session.user?.roles?.includes("user")) {
    redirect("/login");
  }

  const appointments = await getAppointments(session.accessToken as string);

  const upcomingAppointments = appointments
    .filter((app) => new Date(app.dateTime) > new Date())
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const nextVisit = upcomingAppointments[0];

  // 3. Wyciągnięcie imienia (fallback na email, jeśli imię nie zostało podane przy rejestracji)
  const userName =
    session.user.name || session.user.email?.split("@")[0] || "Użytkowniku";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* SEKCJA POWITALNA */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Cześć, <span className="text-emerald-600">{userName}!</span> 👋
            </h1>
            <p className="text-gray-500 mt-2">
              Witamy w Twoim prywatnym panelu. Jak się dzisiaj czujesz?
            </p>
          </div>
          <div>
            <Link
              href="/pacjent/kalendarz"
              className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
            >
              + Umów nową wizytę
            </Link>
          </div>
        </header>

        {/* GŁÓWNY GRID (WIDŻETY) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WIDŻET 1: Najbliższa wizyta (DYNAMICZNY) */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Twoja najbliższa wizyta
              </h2>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {nextVisit ? "Nadchodząca" : "Brak zaplanowanych"}
              </span>
            </div>

            {nextVisit ? (
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-16 h-16 shrink-0">
                  <span className="text-sm font-bold text-red-500">
                    {new Date(nextVisit.dateTime)
                      .toLocaleString("pl-PL", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <span className="text-xl font-black text-gray-800">
                    {new Date(nextVisit.dateTime).getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    Wizyta terapeutyczna
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    z {nextVisit.therapistName}
                  </p>
                  <p className="text-gray-600 font-medium mt-2">
                    ⏱{" "}
                    {new Date(nextVisit.dateTime).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                Nie masz zaplanowanych wizyt. Kliknij &quot;Umów nową
                wizytę&quot;.
              </div>
            )}
          </div>

          {/* WIDŻET 2: Szybkie linki / Twój terapeuta */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Twój terapeuta
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
                AK
              </div>
              <div>
                <p className="font-bold text-gray-800">mgr Anna Kowalska</p>
                <p className="text-sm text-gray-500">Psychoterapeuta CBT</p>
              </div>
            </div>

            <button className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Wyślij wiadomość
            </button>
            <button className="w-full py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
              Przejdź do notatek
            </button>
          </div>
        </div>
        <ActionTiles />
      </div>
    </div>
  );
}
