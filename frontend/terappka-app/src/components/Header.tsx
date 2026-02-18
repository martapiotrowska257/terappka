"use client";

import Link from "next/link";
import LoginButton from "./LoginButton";
import { useSession } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    const isAdmin = session?.user?.roles?.includes("admin");
    const isTherapist = session?.user?.roles?.includes("therapist");

    return (
        <header className="bg-emerald-300 p-4">
            <h1>
                {/* DODAĆ LOGO */}
                <Link href="/" className="text-white text-2xl font-bold">
                TerAppka
                </Link>
            </h1>
            {isAdmin && (
                <Link href="/admin" className="bg-red-500 text-white px-4 py-2">
                    Panel Administratora
                </Link>
            )}
            {isTherapist && (
                <Link href="/terapeuta" className="bg-green-500 text-white px-4 py-2">
                    Panel Terapeuty
                </Link>
            )}
            <LoginButton />

        </header>
    )
}