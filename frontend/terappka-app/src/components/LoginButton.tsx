"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <></>;
  }

  if (session) {
    const roleDisplay = session.user?.roles?.includes("admin")
      ? "Administrator"
      : session.user?.roles?.includes("therapist")
        ? "Terapeuta"
        : "Użytkownik";

    return (
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <span className="font-semibold text-white block text-sm">
            {session.user?.name || session.user?.email?.split("@")[0]}
          </span>
          <span className="text-xs text-emerald-100 block">{roleDisplay}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 text-sm font-medium text-emerald-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-500 transition-colors shadow-sm"
        >
          Wyloguj
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="px-6 py-2 text-sm font-medium text-emerald-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-500 shadow-sm transition-colors"
    >
      Zaloguj się
    </Link>
  );
}
