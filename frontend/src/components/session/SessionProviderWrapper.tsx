"use client";

import { SessionProvider } from "next-auth/react";
import SessionTimeoutWatcher from "./SessionTimeoutWatcher";

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionTimeoutWatcher />
      {children}
    </SessionProvider>
  );
}
