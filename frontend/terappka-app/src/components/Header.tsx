"use client";

import Link from "next/link";
import LoginButton from "./LoginButton";

export default function Header() {

    return (
        <header className="bg-emerald-300 p-4">
            <h1>
                {/* DODAĆ LOGO */}
                <Link href="/" className="text-white text-2xl font-bold">
                TerAppka
                </Link>
            </h1>
            <LoginButton />
        </header>
    )
}