"use client";

import { SessionProvider } from "next-auth/react";
import SessionTimeoutWatcher from "./SessionTimeoutWatcher"; // <-- Importujemy strażnika

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* Strażnik sesji zaczyna nasłuchiwać globalnie w całej aplikacji */}
      <SessionTimeoutWatcher />
      {children}
    </SessionProvider>
  );
}
