"use client";

import { useSession, signOut } from "next-auth/react";

export default function SessionTimeoutWatcher() {
  const { data: session } = useSession();

  const isSessionExpired = session?.error === "RefreshAccessTokenError";

  if (!isSessionExpired) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6 transform transition-all"
        style={{ animation: "popUp 0.3s ease-out forwards" }}
      >
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
          ⏳
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sesja wygasła
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Ze względów bezpieczeństwa Twoja sesja wygasła z powodu
            nieaktywności. Zaloguj się ponownie, aby kontynuować korzystanie z
            aplikacji.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
        >
          Przejdź do logowania
        </button>
      </div>

      <style jsx>{`
        @keyframes popUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
