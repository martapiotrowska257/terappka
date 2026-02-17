import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Keycloak",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const payload = new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: "password",
          username: credentials.email, // Keycloak mapuje email jako username często, sprawdź to
          password: credentials.password,
          scope: "openid profile email",
        });

        try {
          // 1. Żądanie o token do Keycloak
          const res = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: payload,
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("Błąd logowania Keycloak:", data);
            throw new Error(data.error_description || "Błąd logowania");
          }

          // 2. Pobranie danych użytkownika (opcjonalne, jeśli token nie ma wszystkiego)
          // Często wystarczy zdekodować access_token, ale tu dla pewności pobieramy userinfo
          // lub zwracamy podstawowe dane zmapowane z inputu + token
          return {
            id: data.session_state || "unknown", // lub sparsuj sub z tokena
            name: credentials.email, 
            email: credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
          };

        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Początkowe logowanie
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        // Obliczamy czas wygaśnięcia (aktualny czas + czas życia tokena)
        token.expiresAt = Date.now() + (user.expiresIn as number) * 1000;
      }
      
      // Tutaj można dodać logikę odświeżania tokena (Refresh Token Rotation),
      // jeśli token wygasł. Dla uproszczenia pomijam to w tym kroku.
      
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/", // Gdzie przekierować w razie błędu (opcjonalne)
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };