// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Ta funkcja uruchomi się tylko wtedy, gdy użytkownik JEST zalogowany 
  // (dzięki callbackowi poniżej). Tutaj sprawdzamy szczegółowe role.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Definiujemy role (upewnij się, że pasują do tych z Keycloaka)
    const isPatient = token?.roles?.includes("user");
    const isTherapist = token?.roles?.includes("therapist");
    const isAdmin = token?.roles?.includes("admin");

if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/terapeuta") && !isTherapist) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/pacjent") && !isPatient) {
      return NextResponse.redirect(new URL("/", req.url));
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
    "/user/:path*"      // Chroni panel użytkownika (wystarczy samo bycie zalogowanym)
  ],
};