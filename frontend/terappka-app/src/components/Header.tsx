// src/components/Header.tsx
"use client";

import Link from "next/link";
import LoginButton from "./LoginButton";
import { useSession } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    // 1. Logika określania ścieżki powrotnej na podstawie roli
    let dashboardLink = "/";
    if (session?.user?.roles?.includes("admin")) {
        dashboardLink = "/admin";
    } else if (session?.user?.roles?.includes("therapist")) {
        dashboardLink = "/terapeuta";
    } else if (session?.user?.roles?.includes("user")) {
        dashboardLink = "/pacjent";
    }

    return (
        <header className="bg-emerald-500 p-4 shadow-md sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                
                {/* LOGO - kieruje na stronę główną lub do panelu */}
                <h1>
                    <Link href={session ? dashboardLink : "/"} className="text-white text-2xl font-bold tracking-wide hover:text-emerald-50 transition-colors">
                        TerAppka
                    </Link>
                </h1>

                {/* NAWIGACJA PRAWA STRONA */}
                <nav className="flex items-center gap-6">
                    {session && (
                        <Link 
                            href={dashboardLink} 
                            className="hidden sm:block text-emerald-50 font-medium hover:text-white transition-colors"
                        >
                            Mój Panel
                        </Link>
                    )}
                    
                    {/* Komponent z danymi usera i przyciskiem Log/Wyloguj */}
                    <LoginButton />
                </nav>
            </div>
        </header>
    );
}