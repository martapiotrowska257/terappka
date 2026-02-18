// src/app/terapeuta/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TherapistDashboard() {
    // 1. Pobranie sesji na serwerze
    const session = await getServerSession(authOptions);

    // 2. Weryfikacja roli - wpuszczamy tylko terapeutów
    if (!session || !session.user?.roles?.includes("therapist")) {
        redirect("/signIn");
    }

    // 3. Przygotowanie imienia
    const userName = session.user.name || session.user.email?.split('@')[0] || "Terapeuto";

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* SEKCJA POWITALNA */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Dzień dobry, <span className="text-emerald-600">{userName}</span>
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Oto Twój grafik na dzisiaj. Masz zaplanowane <strong className="text-gray-700">3 wizyty</strong>.
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

                {/* GŁÓWNY GRID WIDŻETÓW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* WIDŻET 1: Dzisiejsze wizyty (Główna kolumna) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Dzisiejsze wizyty</h2>
                            <span className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Pojedyncza karta pacjenta - Atrapa */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                                        JN
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Jan Nowak</h3>
                                        <p className="text-sm text-gray-500">Terapia indywidualna (50 min)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bold text-gray-800">09:00</p>
                                        <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Zakończona</p>
                                    </div>
                                    <button className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200">
                                        Notatki
                                    </button>
                                </div>
                            </div>

                            {/* Pojedyncza karta pacjenta - Atrapa (Aktualna) */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-2 border-emerald-400 rounded-xl bg-emerald-50/30 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                                        AK
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Anna Kowalska</h3>
                                        <p className="text-sm text-gray-500">Terapia indywidualna (50 min)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bold text-gray-800">11:30</p>
                                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded animate-pulse">Trwa teraz</p>
                                    </div>
                                    <button className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors shadow-sm">
                                        Dołącz (Online)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOCZNY PANEL */}
                    <div className="space-y-6">
                        
                        {/* WIDŻET 2: Szybkie akcje */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Szybkie akcje</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors group flex flex-col items-center gap-2 text-center">
                                    <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">📝</span>
                                    <span className="text-xs font-medium text-gray-600">Nowa notatka</span>
                                </button>
                                <button className="p-4 border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors group flex flex-col items-center gap-2 text-center">
                                    <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">➕</span>
                                    <span className="text-xs font-medium text-gray-600">Dodaj pacjenta</span>
                                </button>
                            </div>
                        </div>

                        {/* WIDŻET 3: Powiadomienia */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Powiadomienia</h2>
                            <ul className="space-y-3">
                                <li className="text-sm text-gray-600 pb-3 border-b border-gray-50">
                                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                    <strong>Michał Z.</strong> odwołał wizytę na jutro.
                                </li>
                                <li className="text-sm text-gray-600 pb-3">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Masz 1 nową wiadomość od <strong>Anna K.</strong>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}