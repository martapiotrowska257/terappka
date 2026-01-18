"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <button className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed">
                ...
            </button>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                    <span className="font-semibold block">{session.user?.name}</span>
                    <span className="text-xs text-gray-500">{session.user?.email}</span>
                </div>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Wyloguj
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-colors"
        >
            Zaloguj się
        </button>
    );
}