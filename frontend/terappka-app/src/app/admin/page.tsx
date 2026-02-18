// src/app/admin/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    // Pobieramy sesję bezpośrednio na serwerze
    const session = await getServerSession(authOptions);

    // Podwójne zabezpieczenie (Defense in Depth):
    // Choć Middleware chroni tę ścieżkę, dobrą praktyką jest sprawdzenie
    // uprawnień również tutaj, na wypadek błędnej konfiguracji Middleware.
    if (!session?.user?.roles?.includes("admin")) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Panel Administratora
                </h1>
                <p className="text-gray-600 mb-6">
                    Ta strona jest ściśle tajna i dostępna tylko dla osób z rolą "admin".
                </p>

                <div className="bg-red-50 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Twoje dane z sesji:
                    </h2>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                        <li><strong>Zalogowany jako:</strong> {session.user.email}</li>
                        <li><strong>Twoje role:</strong> {session.user.roles?.join(", ") || "brak ról"}</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow">
                        <h3 className="font-bold text-gray-700 mb-1">Zarządzaj Użytkownikami</h3>
                        <p className="text-sm text-gray-500">Zablokuj, usuń lub edytuj profile pacjentów i terapeutów.</p>
                    </div>
                    <div className="border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow">
                        <h3 className="font-bold text-gray-700 mb-1">Ustawienia Systemu</h3>
                        <p className="text-sm text-gray-500">Konfiguracja integracji, płatności i bazy danych.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}