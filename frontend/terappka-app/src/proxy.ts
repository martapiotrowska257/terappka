// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Ta funkcja uruchomi się tylko wtedy, gdy użytkownik JEST zalogowany 
  // (dzięki callbackowi poniżej). Tutaj sprawdzamy szczegółowe role.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Ochrona ścieżki /admin i jej podstron
    if (path.startsWith("/admin")) {
      // Jeśli użytkownik nie ma w tablicy ról "admin", odrzucamy go
      if (!token?.roles?.includes("admin")) {
        // Zwracamy przekierowanie na stronę główną (lub np. /brak-dostepu)
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 2. Ochrona ścieżki /terapeuta i jej podstron
    if (path.startsWith("/terapeuta")) {
      if (!token?.roles?.includes("therapist")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    // Jeśli wszystkie testy przeszły pomyślnie, pozwalamy na załadowanie strony
    return NextResponse.next();
  },
  {
    callbacks: {
      // Wymagamy, aby użytkownik posiadał token (był w ogóle zalogowany).
      // Jeśli ta funkcja zwróci false, NextAuth automatycznie przekieruje
      // użytkownika na stronę logowania (lub do ścieżki zdefiniowanej w opcji 'pages').
      authorized: ({ token }) => !!token,
    },
  }
);

// Konfiguracja określająca, dla jakich ścieżek Middleware ma się W OGÓLE uruchamiać.
export const config = {
  matcher: [
    "/admin/:path*",      // Chroni /admin oraz np. /admin/users
    "/terapeuta/:path*",  // Chroni /terapeuta oraz np. /terapeuta/kalendarz
    "/profil/:path*"      // Chroni panel użytkownika (wystarczy samo bycie zalogowanym)
  ],
};