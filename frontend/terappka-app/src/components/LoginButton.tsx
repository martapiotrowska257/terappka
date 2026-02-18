// src/components/LoginButton.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginButton() {
    const { data: session, status } = useSession();

    // 1. Ekran ładowania sesji (tzw. skeleton loader)
    if (status === "loading") {
        return (
            <div className="w-24 h-10 bg-emerald-400/50 animate-pulse rounded-lg"></div>
        );
    }

    // 2. Widok dla ZALOGOWANEGO użytkownika
    if (session) {
        // Tłumaczymy techniczną rolę na tekst wyświetlany w interfejsie
        const roleDisplay = session.user?.roles?.includes("admin") ? "Administrator" 
                          : session.user?.roles?.includes("therapist") ? "Terapeuta" 
                          : "Użytkownik";

        return (
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <span className="font-semibold text-white block text-sm">
                        {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-emerald-100 block">
                        {roleDisplay}
                    </span>
                </div>
                
                {/* Przycisk wylogowania. Używamy callbackUrl: "/" aby zawsze wyrzucało na stronę główną publiczną */}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 text-sm font-medium text-emerald-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-500 transition-colors shadow-sm"
                >
                    Wyloguj
                </button>
            </div>
        );
    }

    // 3. Widok dla NIEZALOGOWANEGO użytkownika
    return (
        <Link
            href="/signIn"
            className="px-6 py-2 text-sm font-medium text-emerald-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-500 shadow-sm transition-colors"
        >
            Zaloguj się
        </Link>
    );
}