import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionTiles from "@/src/components/utils/ActionTiles";
import type { Appointment } from "@/src/types/appointment";

async function getAppointments(token: string): Promise<Appointment[]> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://127.0.0.1:5000";
  try {
    const res = await fetch(`${apiUrl}/api/appointments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Błąd pobierania wizyt pacjenta:", error);
    return [];
  }
}

async function getMyTherapist(token: string) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://127.0.0.1:5000";
  try {
    const res = await fetch(`${apiUrl}/api/users/therapist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return { id: null };
    return res.json();
  } catch (error) {
    console.error("Błąd pobierania danych opiekuna:", error);
    return { id: null };
  }
}

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.roles?.includes("user")) {
    redirect("/login");
  }

  const [appointments, therapist] = await Promise.all([
    getAppointments(session.accessToken as string),
    getMyTherapist(session.accessToken as string),
  ]);

  const upcomingAppointments = appointments
    .filter(
      (app) =>
        new Date(app.dateTime) > new Date() && app.status !== "CANCELLED",
    )
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const nextVisit = upcomingAppointments[0];

  const userName =
    session.user.name || session.user.email?.split("@")[0] || "Użytkowniku";

  const therapistInitials = therapist?.id
    ? `${therapist.firstName[0] || ""}${therapist.lastName[0] || ""}`.toUpperCase()
    : "??";

  return (
    <div className="  p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl /50">
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
                    z {nextVisit.therapistName || "Twoim terapeutą"}
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Twój terapeuta
              </h2>

              {therapist?.id ? (
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {therapistInitials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      mgr {therapist.firstName} {therapist.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Dedykowany opiekun</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    ??
                  </div>
                  <div>
                    <p className="font-bold text-gray-500">Brak opiekuna</p>
                    <p className="text-xs text-amber-600">
                      Oczekuj na przypisanie
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-auto">
              <Link
                href={therapist?.id ? "/pacjent/czat" : "#"}
                className={`w-full py-2.5 text-sm font-medium text-center rounded-xl transition-colors block border ${
                  therapist?.id
                    ? "text-gray-700 bg-white border-gray-300 hover:"
                    : "text-gray-400  border-gray-200 cursor-not-allowed pointer-events-none"
                }`}
              >
                Wyślij wiadomość
              </Link>
              <Link
                href="/pacjent/pamietnik"
                className="w-full py-2.5 text-sm font-medium text-center text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors block"
              >
                Otwórz Pamiętnik
              </Link>
            </div>
          </div>
        </div>

        <ActionTiles />
      </div>
    </div>
  );
}
