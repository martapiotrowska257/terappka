import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ScheduleCalendar from "@/src/components/ScheduleCalendar";
import type { Appointment, AppointmentStatus } from "@/src/types/appointment";

// Funkcja pobierająca wizyty zalogowanego pacjenta
async function getPatientAppointments(token: string): Promise<Appointment[]> {
  const apiUrl = process.env.API_URL || "http://127.0.0.1:5000";

  try {
    const res = await fetch(`${apiUrl}/api/appointments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "Błąd pobierania wizyt pacjenta:",
        res.status,
        res.statusText,
      );
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Błąd połączenia z API:", error);
    return [];
  }
}

export default async function PatientCalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.roles?.includes("user")) {
    redirect("/login");
  }

  const appointments = await getPatientAppointments(
    session.accessToken as string,
  );

  const events = appointments.map((app) => {
    const startDate = new Date(app.dateTime);
    // Zakładamy domyślny czas trwania sesji terapeutycznej np. 50 minut
    const endDate = new Date(startDate.getTime() + 50 * 60 * 1000);

    const mappedStatus = app.status as AppointmentStatus;

    return {
      id: String(app.id),
      title: app.therapistName
        ? `Sesja: ${app.therapistName}`
        : "Sesja terapeutyczna",
      start: startDate,
      end: endDate,
      status: mappedStatus,
      therapistId: app.therapistId,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mój harmonogram wizyt
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Przeglądaj swoje nadchodzące oraz historyczne sesje terapeutyczne
              w widoku kalendarza.
            </p>
          </div>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <ScheduleCalendar events={events} isTherapist={false} />
        </div>
      </div>
    </div>
  );
}
