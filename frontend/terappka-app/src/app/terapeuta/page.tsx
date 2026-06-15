import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User } from "@/src/types/user";
import { Appointment } from "@/src/types/appointment";
import { apiUrl, getAppointmentsLabel } from "@/src/lib/utils";
import { isToday } from "@/src/lib/time";

async function getTherapistDashboardData(token: string) {
  try {
    const [resAppts, resPatients, resUnread] = await Promise.all([
      fetch(`${apiUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${apiUrl}/api/users?assigned_only=true`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      // DODANE: Pobieranie liczby nieprzeczytanych wiadomości
      fetch(`${apiUrl}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!resAppts.ok || !resPatients.ok) {
      throw new Error("Błąd pobierania danych z API");
    }

    const appointments = await resAppts.json();
    const patients = await resPatients.json();

    const unreadData = resUnread.ok
      ? await resUnread.json()
      : { unreadCount: 0 };

    return { appointments, patients, unreadCount: unreadData.unreadCount };
  } catch (error) {
    console.error("Błąd pobierania danych serwera:", error);
    return { appointments: [], patients: [], unreadCount: 0 };
  }
}

export default async function TherapistDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.roles?.includes("therapist")) {
    redirect("/login");
  }

  const { appointments, patients, unreadCount } =
    await getTherapistDashboardData(session.accessToken as string);

  const allTodaysAppointments = appointments
    .filter(
      (app: Appointment) =>
        isToday(new Date(app.dateTime)) && app.status !== "AVAILABLE",
    )
    .sort(
      (a: Appointment, b: Appointment) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  const nowTime = new Date().getTime();
  let displayedAppointments = allTodaysAppointments;

  if (allTodaysAppointments.length > 5) {
    displayedAppointments = allTodaysAppointments.filter((app: Appointment) => {
      const appEnd = new Date(app.dateTime).getTime() + 50 * 60 * 1000;
      return appEnd >= nowTime;
    });
  }

  const userName =
    session.user.name || session.user.email?.split("@")[0] || "Terapeuto";

  return (
    <div className="  p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dzień dobry, <span className="text-emerald-600">{userName}</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Oto Twój grafik na dzisiaj. Masz zaplanowane{" "}
              <strong className="text-gray-700">
                {allTodaysAppointments && (
                  <span>
                    {allTodaysAppointments.length}{" "}
                    {getAppointmentsLabel(allTodaysAppointments.length)}
                  </span>
                )}
              </strong>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/terapeuta/pacjenci"
              className="px-5 py-2.5 bg-white border-2 border-emerald-100 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Baza pacjentów
            </Link>
            <Link
              href="/terapeuta/kalendarz"
              className="px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
            >
              Zarządzaj grafikiem
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Dzisiejsze wizyty
              </h2>
              <span className="text-sm font-medium text-gray-500 capitalize">
                {new Date().toLocaleDateString("pl-PL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>

            <div className="space-y-4">
              {displayedAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed rounded-xl">
                  {allTodaysAppointments.length > 0
                    ? "Wszystkie dzisiejsze wizyty zostały już zakończone."
                    : "Brak zaplanowanych pacjentów na dzisiaj. Odpocznij lub uzupełnij wolne terminy w grafiku!"}
                </div>
              ) : (
                displayedAppointments.map((app: Appointment) => {
                  const appDate = new Date(app.dateTime);
                  const appStart = appDate.getTime();
                  const appEnd = appStart + 50 * 60 * 1000;
                  const now = new Date().getTime();

                  const patient = patients.find(
                    (p: User) => p.id === app.patientId,
                  );
                  const patientName = patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "Nieznany Pacjent";
                  const initials = patient
                    ? `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase()
                    : "??";

                  let badgeText = "Zaplanowana";
                  let badgeClass = "text-amber-600 bg-amber-50";
                  let cardClass = "border-gray-100 hover:border-emerald-200";

                  const isLive =
                    now >= appStart &&
                    now <= appEnd &&
                    (app.status === "SCHEDULED" || app.status === "CONFIRMED");

                  if (isLive) {
                    badgeText = "Trwa teraz";
                    badgeClass = "text-blue-600 bg-blue-50 animate-pulse";
                    cardClass = "border-emerald-400 bg-emerald-50/30";
                  } else if (app.status === "COMPLETED") {
                    badgeText = "Zakończona";
                    badgeClass = "text-emerald-600 bg-emerald-50";
                  } else if (app.status === "CANCELLED") {
                    badgeText = "Odwołana";
                    badgeClass = "text-red-600 bg-red-50";
                  } else if (app.status === "NO_SHOW") {
                    badgeText = "Nieobecność";
                    badgeClass = "text-gray-600 bg-gray-100";
                  }

                  const formattedTime = appDate.toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={app.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-white hover:shadow-sm transition-all relative overflow-hidden ${cardClass}`}
                    >
                      {isLive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      )}

                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isLive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {patientName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {app.description || "Terapia indywidualna (50 min)"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-800">
                            {formattedTime}
                          </p>
                          <p
                            className={`text-xs font-medium px-2 py-0.5 rounded inline-block ${badgeClass}`}
                          >
                            {badgeText}
                          </p>
                        </div>

                        {isLive ? (
                          <button className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
                            Dołącz (Online)
                          </button>
                        ) : (
                          <Link
                            href="/terapeuta/kalendarz"
                            className="px-4 py-2 text-sm text-gray-600  hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200"
                          >
                            Zarządzaj
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Szybkie akcje
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/terapeuta/kalendarz"
                  className="p-4 border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors group flex flex-col items-center gap-2 text-center"
                >
                  <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                    📝
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    Nowa wizyta
                  </span>
                </Link>
                <Link
                  href="/terapeuta/czat"
                  className="p-4 border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors group flex flex-col items-center gap-2 text-center"
                >
                  <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
                    💬
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    Czaty
                  </span>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Twoje podsumowanie
              </h2>
              <ul className="space-y-3">
                <li className="text-sm text-gray-600 pb-3 border-b border-gray-50">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Liczba podopiecznych: <strong>{patients.length}</strong>
                </li>
                <li className="text-sm text-gray-600">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Nieodczytane wiadomości:{" "}
                  <strong
                    className={
                      unreadCount > 0 ? "text-emerald-600" : "text-gray-700"
                    }
                  >
                    {unreadCount}
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
