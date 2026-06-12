"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SessionTimeoutWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    // Sprawdzamy, czy w sesji pojawił się błąd wygasłego tokenu z Keycloaka
    if (session?.error === "RefreshAccessTokenError") {
      
      // Wyświetlamy alert użytkownikowi
      alert("Twoja sesja wygasła z powodu nieaktywności. Kliknij OK, aby zalogować się ponownie.");
      
      // Funkcja signOut z NextAuth automatycznie czyści lokalną sesję, 
      // ciasteczka i bezpiecznie przekierowuje użytkownika na stronę logowania
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  // Komponent działa wyłącznie jako proces w tle (nie renderuje nic na ekranie)
  return null; 
}